import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from '../parser/parser.service';
import { ValidatorService } from '../validator/validator.service';
import { ImportUrlsDto } from './dto/import-urls.dto';
import { Body } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly parser: ParserService,
    private readonly validator: ValidatorService,
    private readonly contacts: ContactsService,
  ) {}

  @Get()
  list(
    @Query('isWorking') isWorking?: string,
    @Query('source') source?: string,
    @Query('status') status?: string,
  ) {
    return this.contacts.list({
      isWorking: isWorking === 'true' ? true : isWorking === 'false' ? false : undefined,
      source,
      status,
    });
  }

  @Get('stats')
  stats() {
    return this.contacts.stats();
  }

  @Post('import/file')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return this.parser.importFromFile(file.buffer, file.originalname);
  }

  @Post('import/urls')
  importUrls(@Body() dto: ImportUrlsDto) {
    return this.parser.importFromUrls(dto.urls, dto.skipSupport ?? true);
  }

  @Post('validate')
  validate() {
    return this.validator.validateAllPending();
  }
}
