import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { JinaEmbeddings } from '@langchain/community/embeddings/jina';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

@Injectable()
export class SearchService implements OnModuleInit {
    private splitter: RecursiveCharacterTextSplitter;
    private embeddings: JinaEmbeddings;
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly configService: ConfigService,
    ) { }

    onModuleInit() {
        this.splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 50 });
        this.embeddings = new JinaEmbeddings({
            apiKey: this.configService.get<string>("JINA_API_KEY"),
            model: this.configService.get<string>("JINA_EMBEDDING_MODEL"),
        });
    }

    async searchSimilarVectors(vector: number[], limit = 5) {
        const result = await this.elasticsearchService.search({
            index: this.configService.get<string>("indexName"),
            knn: {
                field: 'embedding',
                query_vector: vector,
                k: limit,
                num_candidates: 100,
            },
            _source: ['content', 'metadata'],
        });

        return result.hits.hits.map(hit => hit._source);
    }

    async search(index: string, query: any) {
        return this.elasticsearchService.search({
            index,
            ...query,
        });
    }

    async extractTextFromPDF(blob: Blob): Promise<{ text: string; pages: number }> {
        try {
            const loader = new PDFLoader(blob);
            const docs = await loader.load();
            const text = docs.map(d => d.pageContent).join('\n');
            return {
                text: text,
                pages: docs.length,
            };
        } catch (error) {
            this.logger.error('Failed to extract text from PDF', error);
            throw new Error('PDF extraction failed');
        }
    }

    cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
    }


    async processAndIngestPdf(file: Express.Multer.File) {
        console.log(`file data=>${JSON.stringify(file)}`)
        try {
            const blob = new Blob([file.buffer as BlobPart], { type: 'application/pdf' });
            const { text, pages } = await this.extractTextFromPDF(blob);
            this.logger.log(`Extracted ${text.length} characters from ${pages} pages`);

            // Step 2: Clean text
            const cleanedText = this.cleanText(text);

            // Step 3: Create chunks from the cleaned text 
            const docs = await this.splitter.createDocuments([cleanedText]);
            const indexName = this.configService.get<string>("indexName") || "safety-manuals";
            // const embedDocs = [];
            for (const doc of docs) {
                const embedding = await this.embeddings.embedQuery(doc.pageContent);
                //TODO: Need to generate inference for keywords and summary of stored data for semantic search
                const meta = {
                    filename: file.originalname,
                    upload_date: new Date().toISOString(),
                    file_size: file.size,
                    mime_type: file.mimetype,
                    total_pages: pages,
                    total_chunks: docs.length
                };

                const response = await this.elasticsearchService.index({
                    index: indexName,
                    document: {
                        "text": doc.pageContent,
                        embedding,
                        meta,
                        timestamp: new Date(),
                    },
                });

                this.logger.log(`file update log=>${JSON.stringify(response)}`)
            }
            return ({ "message": `File successfully uploaded` })
        } catch (error: any) {
            console.error('Error processing PDF:', JSON.stringify(error));
            const { InternalServerErrorException } = require('@nestjs/common');
            throw new InternalServerErrorException(`Failed to process PDF: ${error.message}`);
        }
    }
}
