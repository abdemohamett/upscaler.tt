'use client'

import Image from 'next/image'
import { useState } from 'react';


import { UrlBuilder } from '@bytescale/sdk';
import {
  UploadWidgetConfig,
  UploadWidgetOnPreUploadResult,
} from '@bytescale/upload-widget';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import NSFWFilter from 'nsfw-filter';

import {BiLoader} from 'react-icons/bi'
import { Button } from '@/components/ui/button';
import Toggle from '@/components/Toggle';
import { CompareSlider } from '@/components/CompareSlider';



export default function Home() {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const options: UploadWidgetConfig = {
    //@ts-ignore
    apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : 'free',
    maxFileCount: 1,
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    editor: { images: { crop: false } },
    styles: { colors: { primary: '#000' } },
    onPreUpload: async (
      file: File
    ): Promise<UploadWidgetOnPreUploadResult | undefined> => {
      let isSafe = false;
      try {
        isSafe = await NSFWFilter.isSafe(file);
        console.log({ isSafe });
        //@ts-ignore
        if (!isSafe) va.track('NSFW Image blocked');
      } catch (error) {
        console.error('NSFW predictor threw an error', error);
      }
      if (!isSafe) {
        return { errorMessage: 'Detected a NSFW image which is not allowed.' };
      }
      // if (data.remainingGenerations === 0) {
      //   return { errorMessage: 'No more generations left for the day.' };
      // }
      return undefined;
    },
  };
  

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        if (uploadedFiles.length !== 0) {
          const image = uploadedFiles[0];
          const imageName = image.originalFile.originalFileName;
          const imageUrl = UrlBuilder.url({
            accountId: image.accountId,
            filePath: image.filePath,
            options: {
              transformation: 'preset',
              transformationPreset: 'thumbnail',
            },
          });
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          generatePhoto(imageUrl);
        }
      }}
      width="670px"
      height="250px"
    />
  );

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    try {
      const res = await fetch('/api/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: fileUrl }),
      });
  
      let newPhoto = await res.json();
      setRestoredImage(newPhoto);
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  }

  return (
    <main className=" flex max-w-6xl mx-auto flex-col items-center justify-center py-2 ">
      <div className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-28 pt-8 pb-6 sm:mb-0 mb-8 ">

      <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold  tracking-normal sm:text-6xl mb-10">
       Upscale your <span className='text-blue-500'>image</span> here
     </h1>

      <div className="flex justify-between items-center w-full flex-col mt-4">
      <Toggle
            className={`${restoredLoaded ? 'visible mb-6' : 'invisible'}`}
            sideBySide={sideBySide}
            setSideBySide={(newVal) => setSideBySide(newVal)}
          />
          {restoredLoaded && sideBySide && (
            <CompareSlider
              original={originalPhoto!}
              restored={restoredImage!}
            />
          )}
      {!originalPhoto && (
        <UploadDropZone />
      )}
      {originalPhoto && !restoredImage && (
            <Image
              alt="original photo"
              src={originalPhoto}
              className="rounded-2xl"
              width={475}
              height={475}
            />
        )}

       {restoredImage && originalPhoto && !sideBySide && (
            <div className="flex sm:space-x-4 sm:flex-row flex-col">
              <div>
                <h2 className="mb-3 font-medium text-lg">Original Photo</h2>
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl relative"
                  width={475}
                  height={475}
                />
              </div>
              <div className="sm:mt-0 mt-8">
                <h2 className="mb-3 font-medium text-lg">Restored Photo</h2>
                <a href={restoredImage} target="_blank" rel="noreferrer">
                  <Image
                    alt="restored photo"
                    src={restoredImage}
                    className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in"
                    width={475}
                    height={475}
                    onLoadingComplete={() => setRestoredLoaded(true)}
                  />
                </a>
              </div>
            </div>
          )}

       {loading && (
            <Button
              disabled
              className='mt-4'
              // className="bg-black rounded-full text-white font-medium px-2 pt-2 pb-3 mt-8 hover:bg-black/80 w-40"
            >
              <span className=" flex items-center ml-2 gap-2">
                <BiLoader className="animate-spin" size={22}/>
                Upscaling...
              </span>
            </Button>
          )}


       <div className="flex space-x-2 justify-center">
            {originalPhoto && !loading && (
              <Button

                onClick={() => {
                  setOriginalPhoto(null);
                  setRestoredImage(null);
                  setRestoredLoaded(false);
                  setError(null);
                }}
                className='mt-6'
              >
                Upload New Photo
              </Button>
            )}
          </div>
      </div>

      </div>
    </main>

  )
}
