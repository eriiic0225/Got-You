

function SkeletonCard(){
  return (
    <div className='bg-bg-secondary rounded-2xl overflow-hidden animate-pulse'>
      <div className='h-36 md:h-48 bg-bg-tertiary'/>
      <div className='px-3 py-2 space-y-2'>
        <div className='h-4 bg-bg-tertiary rounded w-2/3'/>
        <div className='h-3 bg-bg-tertiary rounded w-1/2'/>
        <div className='h-3 bg-bg-tertiary rounded w-3/5'/>
      </div>
    </div>
  )
}

export default SkeletonCard