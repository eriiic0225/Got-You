import PostForm from "@/components/posts/PostForm"
import { createClient } from "@/lib/supabase/server"

export default async function CreatePostPage() {
  const supabase = await createClient()
  const { data: sportTypes } = await supabase
    .from('sport_types')
    .select('id, name, category, icon')
    .order('created_order')

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-8">
      <PostForm sportTypes={sportTypes!}/>
    </div>
  )
}