import { createJWT } from "../../../utils/createJWT";
import User from "../../../entities/User";
import { EmailSignUpMutationArgs, EmailSignUpResponse } from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";
import { Verification } from "../../../entities/Verification.entity";
import { sendVerificationEmail } from "../../../utils/sendEmail";

export const resolvers: Resolvers = {
    Query: {
        user: (parent, args, context) => {
            console.log(context.req.user);
            return ""
        }
    },
    Mutation:{
        EmailSignUp: async(
            _, args: EmailSignUpMutationArgs
        ):Promise<EmailSignUpResponse> => {
            const {email} = args
            try{
                const existingUser = await User.findOne({email})
                if(existingUser){
                    return{
                        ok: false,
                        error: `You Should log in instead`,
                        token: null
                    }
                }else{
                    const phoneVerification = await Verification.findOne({
                        payload: args.phoneNumber,
                        verified: true
                    });
                    if(phoneVerification){
                        const newUser = await User.create({...args}).save()
                        if(newUser.email){
                            const emailVerification = await Verification.create({
                                payload: newUser.email,
                                target: "EMAIL"
                            }).save()
                            await sendVerificationEmail(
                                newUser.fullName,
                                emailVerification?.key
                            )
                        }
                        const token = createJWT(newUser.id)
                        return{
                            ok: true,
                            error: null,
                            token
                        }
                    }else{
                        return{
                            ok: false,
                            error: `You haven't verified your phone number`,
                            token:null
                        }
                    }
                }
            }catch(error){
                return{
                    ok: false,
                    error: error.message,
                    token:null
                }
            }
        }
    }
}