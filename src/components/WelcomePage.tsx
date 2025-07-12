import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage(): JSX.Element {
  const navigate = useNavigate();

  const handleGetStarted = (): void => {
    console.log('Get Started clicked');
    navigate('/dashboard'); // Update with your actual route
  };

  return (
    <article className="flex w-[320px] pt-[24px] pr-[24px] pb-[24px] pl-[24px] flex-col gap-[24px] items-center flex-nowrap bg-white rounded-[12px] shadow-lg mx-auto my-[60px]">
      {/* WelcomeHeader */}
      <header className="flex w-[233px] h-[27px] justify-center items-start shrink-0">
        <h1 className="font-['Poppins'] text-[20px] font-semibold leading-[27px] text-[#334756] tracking-[-0.5px] text-center whitespace-nowrap">
          Welcome, Food Partner!
        </h1>
      </header>

      {/* WelcomeImage */}
      <figure className="w-[206px] h-[137px] shrink-0">
        <div 
          className="w-full h-full bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/TSzJTsENFD.png)] bg-cover bg-no-repeat bg-center rounded-lg"
          role="img"
          aria-label="Food delivery illustration"
        />
      </figure>

      {/* WelcomeDescription */}
      <section className="flex w-[256px] h-[80px] justify-center items-start shrink-0">
        <p className="font-['Hind_Guntur'] text-[14px] font-normal leading-[20px] text-[#77848d] tracking-[-0.35px] text-center">
          We're excited to have you on board. Your delicious meals will now reach
          hungry travelers across the rails.
        </p>
      </section>

      {/* GetStartedButton */}
      <button
        onClick={handleGetStarted}
        className="flex w-[272px] h-[60px] pt-[15px] pr-[15px] pb-[15px] pl-[15px] justify-between items-center shrink-0 flex-nowrap bg-[#09091a] rounded-[15px] shadow-[0_25px_50px_0_rgba(0,0,0,0.1)] hover:bg-[#1a1a2e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#09091a] focus:ring-offset-2"
        aria-label="Get started with food delivery partnership"
      >
        <span className="h-[24px] shrink-0 font-['Poppins'] text-[16px] font-medium leading-[24px] text-white tracking-[-0.4px] whitespace-nowrap">
          Get Started
        </span>
        <div 
          className="w-[18px] h-[18px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-07-04/BVE3jzTaGp.png)] bg-cover bg-no-repeat"
          role="img"
          aria-label="Arrow icon"
        />
      </button>
    </article>
  );
}

