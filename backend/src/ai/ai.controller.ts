import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    async chat(@Body('query') query: string) {
        if (!query) {
            return { error: 'Query is required' };
        }
        return this.aiService.generateSafetyInsight(query);
    }
}
