import { createRouter, createWebHistory } from 'vue-router'

import dialog from '@/views/DialogDemo.vue'
import excel from '@/views/ExcelDemo.vue'
import pdf from '@/views/PdfDemo.vue'
import word from '@/views/WordDemo.vue'
import office from '@/views/OfficeDemo.vue'
import Test from '@/views/Test.vue'
import Form from '@/views/FormDemo.vue'
import SaturationLine from '@/views/SaturationLineDemo.vue'
import Image from '@/views/ImageDemo.vue'
import ReadMe from '@/views/ReadMe.vue'
import MD from '@/views/MDDemo.vue'
import NsTableDemo from '@/views/NsTableDemo/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/layout/HLayout.vue'),
      children: [
        {
          path: '',
          name: 'readme',
          component: ReadMe,
        },
        {
          path: '/md',
          name: 'md',
          component: MD,
        },
        {
          path: '/dialog',
          name: 'dialog',
          component: dialog,
        },
        {
          path: '/excel',
          name: 'excel',
          component: excel,
        },
        {
          path: '/pdf',
          name: 'pdf',
          component: pdf,
        },
        {
          path: '/word',
          name: 'word',
          component: word,
        },
        {
          path: '/office',
          name: 'office',
          component: office,
        },
        {
          path: '/form',
          name: 'form',
          component: Form,
        },
        {
          path: '/test',
          name: 'test',
          component: Test,
        },
        {
          path: '/image',
          name: 'image',
          component: Image,
        },
        {
          path: '/saturationline',
          name: 'saturationline',
          component: SaturationLine,
        },
        {
          path: '/nstable',
          name: 'nstable',
          component: NsTableDemo,
        }
      ],
    },
  ],
})

export default router
