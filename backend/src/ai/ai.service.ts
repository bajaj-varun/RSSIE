import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class AiService {
    private embeddings: GoogleGenerativeAIEmbeddings;
    private model: ChatGoogleGenerativeAI;

    constructor(
        private readonly searchService: SearchService,
        private readonly configService: ConfigService,
    ) {
    }

    async generateSafetyInsight(userQuery: string) {
        // 1. Generate embedding for the query
        const queryEmbedding = await this.embeddings.embedQuery(userQuery);

        // 2. Retrieve relevant context from Elasticsearch
        const contextResults = await this.searchService.searchSimilarVectors(queryEmbedding);
        const contextText = contextResults
            .map((res: any) => res.content)
            .join('\n\n---\n\n');

        // 3. Generate response using LLM
        const response = await this.model.invoke([
            new SystemMessage(
                `You are a Senior Aviation Safety Officer. 
        Use the following safety manual context to answer the query accurately.
        If the answer is not in the context, state that you don't have enough specific data but provide general safety guidelines.
        
        CONTEXT:
        ${contextText}`
            ),
            new HumanMessage(userQuery),
        ]);

        return {
            insight: response.content,
            sources: contextResults.map((res: any) => res.metadata),
        };
    }
}
