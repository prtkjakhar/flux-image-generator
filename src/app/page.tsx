'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [disableSafetyChecker, setDisableSafetyChecker] = useState(false);
  const [imageData, setImageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setImageData(null);
      const response = await axios.post('/api', {
        input: {
          prompt,
          aspectRatio,
          disableSafetyChecker,
        },
      });

      const data = response.data;
      console.log(data);
      setImageData(data);

      // Start polling for image status
      const intervalId = setInterval(() => {
        checkImageStatus(data);
      }, 4000);
      intervalRef.current = intervalId;
    } catch (error) {
      console.error(error);
    }
  };

  const checkImageStatus = async (imageStatusData: any) => {
    if (!imageStatusData) return;

    try {
      const response = await axios.get('/api', {
        params: {
          url: imageStatusData.urls.get,
        },
      });

      const data = response.data;
      console.log(data);
      setImageData(data);
      if (data.status === 'succeeded' || data.status === 'failed') {
        setLoading(false);
        clearInterval(intervalRef.current); // Stop polling on success
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    // Cleanup function to clear polling interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center m-auto">
      <h1 className="text-3xl font-bold mt-2">Flux Image Generator</h1>
      <div className="flex items-center justify-center w-[90%] max-w-[400px] max-h-[450px] my-5 border border-black">
        {!imageData ? (
          <p>Image will appear here</p>
        ) : loading ? (
          <p>
            <CircularProgress sx={{ color: 'black' }} className="m-2" />
          </p>
        ) : (
          <img src={imageData?.output} alt="Generated image" className='max-h-[400px]' />
        )}
      </div>
      <div className='fixed bottom-[180px] w-[95%] flex justify-between flex-row-reverse max-w-[550px]'>
        <Select value={aspectRatio} onValueChange={setAspectRatio}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Aspect Ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">1:1</SelectItem>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="9:16">9:16</SelectItem>
            <SelectItem value="3:2">3:2</SelectItem>
            <SelectItem value="2:3">2:3</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 ">
          <Checkbox id="safety" onCheckedChange={() => setDisableSafetyChecker(!disableSafetyChecker)} defaultChecked={false} />
          <label
            htmlFor="safety"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Disable Safety
      </label>
    </div>
      </div>
      <div className="fixed bottom-0 flex items-center justify-center w-full m-5">
        <Textarea
          placeholder="Prompt"
          className="w-full max-w-[500px] mx-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
        />
        <Button
          disabled={loading}
          variant="default"
          className="rounded-full w-[50px] mr-1"
          onClick={fetchData}>
          <SendRoundedIcon />
        </Button>
      </div>
    </div>
  );
}
