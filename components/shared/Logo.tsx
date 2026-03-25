

const Logo = ({ className }: { className?: string }) => (
<>
  <svg className={className} viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="#C4DC4A">
      <path d="M200 40C133.7 40 80 93.7 80 160C80 250 200 380 200 380C200 380 320 250 320 160C320 93.7 266.3 40 200 40ZM200 270C139.2 270 90 220.8 90 160C90 99.2 139.2 50 200 50C260.8 50 310 99.2 310 160C310 220.8 260.8 270 200 270Z" />
      
      <rect x="185" y="110" width="30" height="100" rx="4" />
      <rect x="150" y="145" width="100" height="30" rx="4" />
      
      <circle cx="200" cy="160" r="10" fill="#1A1D29" />
    </g>
  </svg>
  <img src="public/Logo-removebg.png" className="size-20" alt="" />
</>
);

export default Logo