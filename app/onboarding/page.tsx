'use client'
import { useState } from "react";
import Step1Profile from "./Step1Profile";
import Step2Sports from "./Step2Sports";
import Step3Locations from "./Step3Locations";
import { IoMdArrowBack } from "react-icons/io";
import type { userInfo } from './Step1Profile'

// const fieldTitleClassese = ""
// const inputClassese = ""


function OnBoarding(){
  const [ stepCount, setStepCount ] = useState(1)

  const [ formData, setFormData ] = useState<userInfo>({
    nickname: "",
    gender: null,
    birthday: "",
    bio: ""
  })
  const [selectedSports, setSelectedSports] = useState<string[]>([])

  const toNextStep = ()=>{
    setStepCount(stepCount+1)
  }

  const toPrevStep = ()=>{
    setStepCount(stepCount-1)
  }

  const onStep2Complete = (sports:string[])=>{
    setSelectedSports(sports)
  }


  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4">
      {/* 外層為整體包裹置中用的容器，再來則是包裹所有主要內容的容器 */}
      <div className="w-[90%] max-w-sm min-h-screen flex flex-col gap-4 pb-3">
        {/* 回上一部按鈕 */}
        {stepCount > 1 && <IoMdArrowBack size={30} onClick={toPrevStep} className="absolute top-3 translate-x-1 cursor-pointer p-1 rounded-full hover:bg-bg-tertiary"/>}
        {/* 進度顯示條 */}
        <nav className="w-full max-w-sm flex justify-center">
          <div className="flex grow-0 items-center gap-1 mt-5 mb-2 h-2.5">
            <div className={`w-8 h-1 rounded-full ${stepCount >= 1 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
            <div className={`w-8 h-1 rounded-full ${stepCount >= 2 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
            <div className={`w-8 h-1 rounded-full ${stepCount >= 3 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
          </div>
        </nav>
        
        {stepCount === 1 && <Step1Profile toNextStep={toNextStep} setFormData={setFormData} />}
        {stepCount === 2 && <Step2Sports toNextStep={toNextStep} onComplete={onStep2Complete} />}
        {stepCount === 3 && <Step3Locations />}
      </div>
      
    </div>
  )
}


export default OnBoarding