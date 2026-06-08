import { Module } from '@nestjs/common';
import { ExcelExporter } from './excel.exporter';
import { ExportController } from './export.controller';

@Module({
  controllers: [ExportController],
  providers: [ExcelExporter],
  exports: [ExcelExporter],
})
export class ExportModule {}
