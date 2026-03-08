'use client'
import { useState } from "react";
import Step1Profile from "./Step1Profile";
import Step2Sports from "./Step2Sports";
import Step3Locations from "./Step3Locations";
import { IoMdArrowBack } from "react-icons/io";
import type { userInfo } from './Step1Profile'
import { APIProvider } from '@vis.gl/react-google-maps'
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from 'next/navigation'

// const fieldTitleClassese = ""
// const inputClassese = ""


function OnBoarding(){

  const router = useRouter()
  const user = useAuthStore((state)=>state.user)
  const isAuthLoading = useAuthStore((state)=>state.isLoading)
  const [ stepCount, setStepCount ] = useState(1)
  const [ avaterFile, setAvaterFile ] = useState<File|null>(null)
  const [ avatarPreviewUrl, setAvatarPreviewUrl ] = useState<string | null>(null)

  const [ formData, setFormData ] = useState<userInfo>({ //初始狀態
    nickname: "",
    gender: null,
    birthday: "",
    bio: ""
  })
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedPlaces, setSelectedPlaces] = useState<google.maps.places.Place[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const toNextStep = ()=>{
    setStepCount(stepCount+1)
  }

  const toPrevStep = ()=>{
    setStepCount(stepCount-1)
  }

  const onStep2Complete = (sports:string[])=>{
    setSelectedSports(sports)
  }

  const completeOnboarding = async()=>{
    if (!user) {
      console.log("抓取不到用戶資料！")
      return
    }
    setIsSubmitting(true)
    setSubmitError("")
    console.log(user.id)

    let avatarUrl = null

    if (avaterFile){
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/avatar.jpg`, avaterFile, {upsert: true})

      if (uploadError){
        console.log("uploadError", uploadError)
        setSubmitError("上傳頭貼失敗，請再試一次")
        setIsSubmitting(false)
        return
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}/avatar.jpg`);

      avatarUrl = data.publicUrl
    }

    const {error:userError} = await supabase
      .from("users")
      .update({...formData, avatar_url: avatarUrl})
      .eq("id", user.id)
    if (userError) {
      console.log('userError:', userError)
      setSubmitError("儲存個人資料失敗，請再試一次")
      setIsSubmitting(false)
      return
    }

    const sportPreferences = selectedSports.map((s)=>({user_id: user.id, sport_type_id: s}))
    const {error:sportError} = await supabase
      .from("user_sport_preferences")
      .upsert(sportPreferences)
    if (sportError) {
      console.log('sportError:', sportError)
      setSubmitError("儲存運動偏好失敗，請再試一次")
      setIsSubmitting(false)
      return
    }

    const userLocations = selectedPlaces.map((p)=>({user_id: user.id, location_id: p.id}))
    const {error:locationError} = await supabase
      .from("user_gym_locations")
      .upsert(userLocations)
    if (locationError) {
      console.log('locationError:', locationError)
      setSubmitError("儲存常去地點失敗，請再試一次")
      setIsSubmitting(false)
      return
    }


    router.push("/explore")
  }

  const onAvatarSelect = (avatar:File)=>{
    setAvaterFile(avatar)
    setAvatarPreviewUrl(URL.createObjectURL(avatar)) //生成預覽用的 url & 放進state往下層傳
  }



  // auth 尚未初始化完成，先不 render（避免 user 是 null 的瞬間）
  if (isAuthLoading) return null

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>

      <div className="w-full min-h-screen flex flex-col items-center px-4">
        {/* 外層為整體包裹置中用的容器，再來則是包裹所有主要內容的容器 */}
        <div className="w-[90%] max-w-sm min-h-screen flex flex-col gap-4 pb-3">
          {/* 回上一部按鈕 */}
          {stepCount > 1 && <IoMdArrowBack size={30} onClick={toPrevStep} className="absolute top-1 translate-x-1 cursor-pointer p-1 rounded-full hover:bg-bg-tertiary"/>}
          {/* 進度顯示條 */}
          <nav className="w-full max-w-sm flex justify-center">
            <div className="flex grow-0 items-center gap-1 mt-3.5 h-2.5">
              <div className={`w-8 h-1 rounded-full ${stepCount >= 1 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
              <div className={`w-8 h-1 rounded-full ${stepCount >= 2 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
              <div className={`w-8 h-1 rounded-full ${stepCount >= 3 ? 'bg-primary' : 'bg-bg-tertiary'}`}></div>
            </div>
          </nav>
          
          {stepCount === 1 && <Step1Profile toNextStep={toNextStep} setFormData={setFormData} formData={formData} avatarPreviewUrl={avatarPreviewUrl} onAvatarSelect={onAvatarSelect}/>}
          {stepCount === 2 && <Step2Sports toNextStep={toNextStep} onComplete={onStep2Complete} initialSelectedSports={selectedSports} />}
          {stepCount === 3 && <Step3Locations selectedPlaces={selectedPlaces} setSelectedPlaces={setSelectedPlaces} completeOnboarding={completeOnboarding} isSubmitting={isSubmitting} submitError={submitError}/>}
        </div>
        
      </div>

    </APIProvider>
  )
}


export default OnBoarding