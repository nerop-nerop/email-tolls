import { Module } from '@nestjs/common';
import { FileParser } from './file.parser';
import { HtmlParser } from './html.parser';
import { ParserService } from './parser.service';

@Module({
  providers: [FileParser, HtmlParser, ParserService],
  exports: [ParserService, FileParser, HtmlParser],
})
export class ParserModule {}
