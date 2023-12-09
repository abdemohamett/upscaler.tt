import { NextResponse } from "next/server";
import Replicate from "replicate";


const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY!,
  });



export async function POST(req: Request){
 try {
    const body = await req.json()
    const { imageUrl } = body


    const response = await replicate.run(
        "fewjative/ultimate-sd-upscale:5daf1012d946160622cd1bd45ed8f12d9675d24659276ccfe24804035f3b3ad7",
        {
          input: {
            image: imageUrl,
            a_prompt:
            "best quality, extremely detailed, cinematic photo, ultra-detailed, ultra-realistic, award-winning, best of the best, colorful, realistic",
          }
        }
      );

   return NextResponse.json(response)
 } catch (error) {
    return new NextResponse('Internal Error', {status: 500})
 }
}