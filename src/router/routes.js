import HomeView from '@/views/HomeView.vue'
import ResearchView from '@/views/ResearchView.vue'
import MembersView from '@/views/MembersView.vue'
import PublicationsView from '@/views/PublicationsView.vue'
import ActivitiesView from '@/views/ActivitiesView.vue'
import ContactView from '@/views/ContactView.vue'

// 全部采用静态导入：避免代码分割，使打包产物可内联为单文件、可用 file:// 直接打开
export const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { key: 'home' } },
  { path: '/research', name: 'research', component: ResearchView, meta: { key: 'research' } },
  { path: '/members', name: 'members', component: MembersView, meta: { key: 'members' } },
  {
    path: '/publications',
    name: 'publications',
    component: PublicationsView,
    meta: { key: 'publications' }
  },
  { path: '/activities', name: 'activities', component: ActivitiesView, meta: { key: 'activities' } },
  { path: '/contact', name: 'contact', component: ContactView, meta: { key: 'contact' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default routes
