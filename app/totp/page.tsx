'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Config } from '../config';

function useInterval(callback: any, delay: any) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      // @ts-ignore: Unreachable code error
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Page() {
  const [userToken, setUserToken] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<Number>(0);
  const [totpCode, setTotpCode] = useState<string>("");
  const [runInterval, setRunInterval] = useState<boolean>(false);
  const [refreshIn, setRefreshIn] = useState<Number>(0);

  const router = useRouter();

  useEffect(
    () => {
      const userData = new Map();
      const params = window.location.hash.substring(1).split("&");
  
      params.forEach(
        (p) => {
          let [k, v] = p.split("=");
          userData.set(k, v);
        }
      );
      
      setUserToken(userData.get("access_token"));

      setRunInterval(true);
    },
    []
  );

  useInterval(
    updateCountdown,
    runInterval ? 1000 : null
  );

  function updateCode() {
    fetch(
      "/api/auth",
      {
        method: "POST",
        headers: {
          "Authorization": userToken
        }
      }
    ).then((res) => {
      if (res.status !== 200) {
        setRunInterval(false);
      } else {
        res.json().then(
          (data) => setTotpCode(data.code)
        );
      }

      setAuthStatus(res.status);
    });
  }

  function updateCountdown() {
    const seconds = new Date().getSeconds();

    setRefreshIn(30 - seconds % 30);

    if (seconds === 0 || seconds === 30 || totpCode.length !== 6) {
      updateCode();
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
    switch (authStatus) {
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
