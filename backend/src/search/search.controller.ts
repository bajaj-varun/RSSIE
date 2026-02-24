import { Controller, Post, Body, Get, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchService } from './search.service';

@Controller('safety-manuals')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post('ingest')
    @UseInterceptors(FileInterceptor('file'))
    async ingest(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.searchService.processAndIngestPdf(file);
    }

    @Get('search')
    async search(@Query('query') query: string) {
        if (!query) {
            return { message: 'Please provide a search query' };
        }
        // This is still a placeholder, actual vector search is in AiService
        return { message: 'Vector search is performed via the /ai/chat endpoint.' };
    }
}
