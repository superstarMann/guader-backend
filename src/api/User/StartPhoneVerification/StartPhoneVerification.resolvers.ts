import { sendVerificationSMS } from "../../../utils/sendSMS";
import { Verification } from "../../../entities/Verification.entity";
import { StartPhoneVerificationMutationArgs, StartPhoneVerificationResponse } from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";

export const resolvers: Resolvers = {
    Mutation: {
        StartPhoneVerification: async(
            _, args: StartPhoneVerificationMutationArgs
        ): Promise<StartPhoneVerificationResponse> =>{
            const {phoneNumber} = args
            try{
                const existingVerification = await Verification.findOne({
                    payload: phoneNumber
                })
                if(existingVerification){
                    existingVerification.remove()
                }
                const newVerification = await Verification.create({
                    payload: phoneNumber,
                    target: "PHONE"
                }).save();
                console.log(newVerification);
                await sendVerificationSMS(newVerification.payload, newVerification.key)
                return{
                    ok: true ,
                    error: null
                }
            }catch(error){
              return{
                  ok: false,
                  error: error.message
              }
            }
        }
    }
}