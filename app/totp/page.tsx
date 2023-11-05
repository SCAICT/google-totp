'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Config } from '../config';

export default function Page() {
  const [authStatus, setAuthStatus] = useState<[boolean | null, Number]>([null, 0]);
  const [totpCode, setTotpCode] = useState<string>("");
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout>();
  const [refreshIn, setRefreshIn] = useState<Number>(0);

  const router = useRouter();

  useEffect(() => {
    const userToken = parseUserToken();

    updateCode(userToken);
    updateCountdown(userToken);

    if (authStatus[0] === true) {
      const interval = setInterval(
        updateCountdown,
        1000,
        { userToken: userToken }
      );
      setUpdateInterval(interval);
    } else {
      clearInterval(updateInterval);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  function parseUserToken(): string {
    const userData = new Map();
    const params = window.location.hash.substring(1).split("&");

    params.forEach(
      (i) => {
        let [k, v] = i.split("=");
        userData.set(k, v);
      }
    );
    
    return userData.get("access_token");
  }

  function updateCode(userToken: string) {
    fetch(
      "/api/auth",
      {
        method: "POST",
        headers: {
          "Authorization": userToken
        }
      }
    ).then((res) => {
      switch (res.status) {
        case 401:
          setAuthStatus([false, res.status]);

          break;
        case 200:
          setAuthStatus([true, res.status]);

          res.json().then(
            (data) => {
              setTotpCode(data.code);
            }
          );

          break;
        default:
          setAuthStatus([false, res.status]);
      }
    });
  }

  function updateCountdown(args: any) {
    const seconds = new Date().getSeconds();

    setRefreshIn(30 - seconds % 30);

    if (seconds === 0 || seconds === 30) {
      updateCode(args.userToken);
    }
  }

  function TotpCode() {
    return <div className="flex flex-col items-center justify-between">
      <div className="flex flex-row items-center justify-between">
        {totpCode.split("").map((code, index) => {
          return <div key={index} className="lg:p-2 md:p-2 p-1">
            <div className="text-center font-mono lg:text-5xl md:text-4xl text-2xl border-2 border-gray-600/75 rounded-md lg:px-4 md:px-4 px-3 lg:py-3 md:py-3 py-2">
              {code}
            </div>
          </div>
        })}
      </div>

      <div className="pb-12 pt-1 font-mono lg:text-lg md:text-lg text-sm">
        Refresh in {refreshIn.toString()} seconds
      </div>

      <button onClick={() => navigator.clipboard.writeText(totpCode)} className="text-gray-950 text-center font-mono font-semibold lg:text-lg md:text-md text-md rounded-lg border-gray-950/75 border-2 lg:px-4 md:px-4 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-white ease-in-out duration-300 transition-all">
        Copy to Clipboard
      </button>
    </div>;
  }

  function ErrorMessage({ msg, desc }) {
    return <div className="flex flex-col items-center justify-between">
      <div className="text-center text-4xl py-4 font-mono font-semibold">
        {msg}
      </div>

      <div className="text-center text-xl font-mono pb-20">
        {desc}
      </div>

      <button onClick={() => router.replace('/')} className="text-gray-950 text-center font-mono font-semibold lg:text-lg md:text-md text-md rounded-lg border-gray-950/75 border-2 lg:px-4 md:px-4 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-white ease-in-out duration-300 transition-all">
        Back to Login
      </button>

      <div className="text-center text-md font-mono py-2">
        OR
      </div>

      <a href={Config.issueUrl} className="text-gray-950 text-center font-mono font-semibold lg:text-lg md:text-md text-md rounded-lg border-gray-950/75 border-2 lg:px-4 md:px-4 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-white ease-in-out duration-300 transition-all">
        Create an Issue
      </a>
    </div>;
  }

  function ShowStatus() {
    switch (authStatus[1]) {
      case 0:
        return <div className="text-center lg:text-3xl md:text-2xl sm:text-xl py-4 font-mono font-semibold">
          Loading...
        </div>;
      case 401:
        return <ErrorMessage msg={"Authentication Failed"} desc={"Create an Issue on Github to request permissions."}/>;
      case 200:
        return <TotpCode/>;
      default:
        return <ErrorMessage msg={"Unknown Error"} desc={"Please try again."}/>;
    }
  }

  return (
    <main className="h-screen w-screen bg-gray-950">
      <div className="flex flex-col items-center justify-between absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ShowStatus/>
      </div>
    </main>
  );
}
