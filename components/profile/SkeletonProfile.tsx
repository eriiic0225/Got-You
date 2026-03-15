
export default function SkeletonProfile(){
  return(
    <div className="md:grid md:grid-cols-[300px_1fr] md:gap-6 animate-pulse">

      {/* 左欄：頭像卡牌 + 按鈕 */}
      <div className='mb-4 md:mb-0'>
        <div className='bg-bg-secondary rounded-2xl overflow-hidden shadow'>

          {/* Cover 漸層背景 */}
          <div className='h-30 bg-gradient-to-br from-bg-tertiary to-primary/20' />

          {/* 頭貼 + 基本資料：-mt-16 讓頭貼跨越 cover 邊界，製造層疊感 */}
          <div className='flex flex-col items-center px-4 pb-5 -mt-20 gap-2'>
            {/* ring-4 ring-bg-secondary 製造頭貼浮起的視覺效果 */}
            <div className='size-44 rounded-xl ring-4 ring-bg-secondary overflow-hidden'>
              <div className="w-full h-full flex items-center justify-center bg-bg-tertiary"></div>
            </div>

            <div className='h-4 bg-bg-tertiary rounded w-2/3'/>
            <div className='h-3 bg-bg-tertiary rounded w-1/2'/>
            <div className='h-3 bg-bg-tertiary rounded w-3/5'/>

          </div>
        </div>
      </div>

      {/* 右欄：詳細資料區塊 */}
      <div className='space-y-4'>

        {/* 常去的運動場所 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow h-35 space-y-2'>
          <div className='h-6 bg-bg-tertiary rounded w-2/3'/>
          <div className='h-4 bg-bg-tertiary rounded w-1/2'/>
          <div className='h-4 bg-bg-tertiary rounded w-4/7'/>
          <div className='h-4 bg-bg-tertiary rounded w-3/5'/>
        </div>

        {/* 偏好運動 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow h-30 space-y-2'>
          <div className='h-6 bg-bg-tertiary rounded w-2/3'/>
          <div className='h-4 bg-bg-tertiary rounded w-3/5'/>
        </div>

        {/* 自我介紹 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow h-40 space-y-2'>
          <div className='h-6 bg-bg-tertiary rounded w-2/3'/>
          <div className='h-4 bg-bg-tertiary rounded w-3/5'/>
          <div className='h-4 bg-bg-tertiary rounded w-1/2'/>
          <div className='h-4 bg-bg-tertiary rounded w-4/7'/>
        </div>

      </div>
    </div>
  )
}