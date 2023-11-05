'use client';

export default function Page() {

  async function googleLogin() {
    let authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    let clientId = "376162470712-ph439pqes52snidcvoluamh36e36j23s.apps.googleusercontent.com";
    let redirectUri = "http://localhost:3000/totp";

    let form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', authUrl);

    let params = {
      "client_id": clientId,
      "redirect_uri": redirectUri,
      "response_type": "token",
      "scope": "https://www.googleapis.com/auth/userinfo.email"
    };

    Object.entries(params).forEach(
      ([key, value]) => {
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        input.setAttribute('value', value);
        form.appendChild(input);
      }
    );

    document.body.appendChild(form);
    form.submit();

    return undefined;
  }

  return (
    <main className="h-screen w-screen bg-gray-950">
      <div className="flex flex-col items-center justify-between absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="font-mono font-medium lg:text-4xl md:text-2xl text-lg text-center py-10">
          SCAICT Google TOTP Authentication
        </div>
        <button onClick={googleLogin} className="text-gray-950 text-center font-mono font-semibold lg:text-xl md:text-lg text-md rounded-lg border-gray-950/75 border-2 lg:px-5 lg:py-4 md:px-4 px-2 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-white ease-in-out duration-300 transition-all">
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
