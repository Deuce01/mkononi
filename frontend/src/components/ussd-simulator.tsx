'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const screens = {
  HOME: 'Welcome to Mkononi Connect.\nRun on Africa\'s Talking\n\nEnter USSD Code:',
  MAIN_MENU: 'CON Mkononi Connect\n1. Search Jobs\n2. My Applications\n0. Exit',
  SEARCH_JOBS: 'CON Search Jobs by:\n1. Skill\n2. Location\n00. Back',
  SKILL_INPUT: 'CON Enter skill (e.g. Plumbing):',
  LOCATION_INPUT: 'CON Enter location (e.g. Nairobi):',
  JOB_RESULTS: 'END We found 3 plumbing jobs in Nairobi. You will receive an SMS with details shortly.',
  MY_APPLICATIONS: 'END You have applied for:\n1. Expert Plumber\n2. Welder\nThank you for using Mkononi Connect.',
  EXIT: 'END Thank you for using Mkononi Connect.',
  INVALID: 'CON Invalid input. Please try again.\n00. Back',
};

export default function UssdSimulator() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>(['HOME']);

  const handleSend = () => {
    let nextScreen = 'INVALID';
    const previousScreen = currentScreen;

    if (currentScreen === 'HOME' && inputValue === '*384*123#') {
      nextScreen = 'MAIN_MENU';
    } else if (currentScreen === 'MAIN_MENU') {
      if (inputValue === '1') nextScreen = 'SEARCH_JOBS';
      else if (inputValue === '2') nextScreen = 'MY_APPLICATIONS';
      else if (inputValue === '0') nextScreen = 'EXIT';
    } else if (currentScreen === 'SEARCH_JOBS') {
      if (inputValue === '1') nextScreen = 'SKILL_INPUT';
      else if (inputValue === '2') nextScreen = 'LOCATION_INPUT';
      else if (inputValue === '00') nextScreen = 'MAIN_MENU';
    } else if (currentScreen === 'SKILL_INPUT' || currentScreen === 'LOCATION_INPUT') {
      if (inputValue) nextScreen = 'JOB_RESULTS';
      else if (inputValue === '00') nextScreen = 'SEARCH_JOBS';
    } else if (currentScreen === 'INVALID' && inputValue === '00') {
      nextScreen = history[history.length - 2] || 'MAIN_MENU';
    }

    if(inputValue === '00' && previousScreen !== 'INVALID' && previousScreen !== 'HOME') {
        const lastScreen = history[history.length - 2]
        nextScreen = lastScreen || 'MAIN_MENU';
        setHistory(prev => prev.slice(0, -1));
    } else {
        setHistory(prev => [...prev, nextScreen]);
    }
    
    setCurrentScreen(nextScreen);
    setInputValue('');
  };

  return (
    <Card className="w-full max-w-sm bg-neutral-900 border-8 border-neutral-900 rounded-3xl shadow-2xl overflow-hidden">
      <CardContent className="p-4 bg-background rounded-xl">
        <div className="aspect-[9/16] flex flex-col justify-between bg-card p-4 rounded-lg">
          <div className="text-sm font-mono whitespace-pre-wrap">
            <p>{screens[currentScreen as keyof typeof screens]}</p>
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-background font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="w-full bg-accent hover:bg-accent/80">
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
