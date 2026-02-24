import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const cloudId = configService.get<string>('ELASTIC_CLOUD_ID');
        const username = configService.get<string>('elastic_cloud_username');
        const password = configService.get<string>('elastic_cloud_password');
        const apiKey = configService.get<string>('ELASTIC_API_KEY');

        if (cloudId) {
          // if (username && password) {
          //   console.log('SearchModule: Configuring Elastic Cloud with Basic Auth (Preferred)');
          //   return {
          //     cloud: { id: cloudId },
          //     auth: { username, password },
          //   };
          // } 
          // else 
          if (apiKey) {
            console.log('SearchModule: Configuring Elastic Cloud with API Key');
            return {
              cloud: { id: cloudId },
              auth: { apiKey: apiKey },
            };
          }
        }

        // Fallback to local
        return {
          node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService, ElasticsearchModule],
  controllers: [SearchController],
})
export class SearchModule { }
