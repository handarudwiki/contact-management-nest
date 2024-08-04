
import { Injectable } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ValidationService{
    validate<T>(zodtype: ZodType<T>, data: T): T{
        const result = zodtype.safeParse(data)
        if(result.success){
            return result.data
        }else{
            throw new Error(result.error.errors.join(', '))
        }
    }
}