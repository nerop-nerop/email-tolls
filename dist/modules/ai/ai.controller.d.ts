import { AiService } from './ai.service';
import { GenerateEmailDto } from './dto/generate-email.dto';
export declare class AiController {
    private readonly ai;
    constructor(ai: AiService);
    generate(dto: GenerateEmailDto): Promise<import("./ai.service").GeneratedEmail>;
}
//# sourceMappingURL=ai.controller.d.ts.map