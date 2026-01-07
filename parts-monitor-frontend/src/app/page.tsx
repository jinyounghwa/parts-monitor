'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Zap,
  TrendingUp,
  Bell,
  BarChart3,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

// Dynamically import the 3D experience with SSR disabled
const Experience = dynamic(() => import('@/components/canvas/Experience'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gray-900" />,
})

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const redirectAttempted = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || loading || redirectAttempted.current) return

    if (isAuthenticated) {
      redirectAttempted.current = true
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router, isClient])

  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 3D Background - Fixed position */}
      <div className="fixed inset-0 z-0 opacity-80 pointer-events-none sm:pointer-events-auto">
        <Experience />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-b from-transparent via-gray-900/80 to-gray-900">
        
        {/* Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Parts Monitor</span>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors text-sm"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 font-medium transition-all transform hover:scale-105 text-sm"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-left z-20">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 backdrop-blur-sm">
              차세대 모니터링 시스템
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight">
              실시간 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                가격 인텔리전스
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              전 세계 유통사의 전자 부품 가격을 추적하세요. 
              즉각적인 알림을 받고, 추세를 분석하며, 스크래퍼를 통해 조달 전략을 최적화할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                무료로 모니터링 시작
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 font-semibold transition-colors backdrop-blur-sm"
              >
                기능 살펴보기
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-white/5 mt-auto mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">강력한 인텔리전스</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              공급망 데이터를 마스터하는 데 필요한 모든 것.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                color: "text-blue-400",
                title: "가격 추적",
                desc: "다중 판매처 자동 추적 및 과거 데이터 시각화."
              },
              {
                icon: Bell,
                color: "text-orange-400",
                title: "스마트 알림",
                desc: "가격 하락 및 재고 입고 시 즉시 알림."
              },
              {
                icon: BarChart3,
                color: "text-purple-400",
                title: "분석",
                desc: "직관적인 대시보드로 시장 동향 심층 분석."
              },
              {
                icon: DollarSign,
                color: "text-green-400",
                title: "다중 판매처",
                desc: "Digikey, Mouser 및 주요 국내외 유통사 지원."
              },
              {
                icon: AlertTriangle,
                color: "text-red-400",
                title: "재고 감시",
                desc: "생산 지연 방지를 위한 재고 부족 경고."
              },
              {
                icon: Zap,
                color: "text-yellow-400",
                title: "자동화",
                desc: "설정만 해두세요. 24/7 모니터링은 저희가 맡겠습니다."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                <div className={`mb-6 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">왜 Parts Monitor인가요?</h2>
              <div className="space-y-6">
                {[
                  { title: "완전 무료", desc: "숨겨진 비용 없음. 모든 모니터링 도구 완전 무료." },
                  { title: "실시간 업데이트", desc: "항상 최신 시장 데이터와 동기화." },
                  { title: "맞춤 설정", desc: "대시보드와 알림을 필요에 맞게 설정하세요." },
                  { title: "사용자 친화적", desc: "엔지니어와 구매 담당자를 위해 설계되었습니다." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-full min-h-[300px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10 flex items-center justify-center p-8 backdrop-blur-md">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">1,000명 이상의 엔지니어와 함께하세요</h3>
                <p className="text-gray-300 mb-8">오늘 바로 부품 비용 최적화를 시작하세요.</p>
                <Link
                   href="/auth/register"
                   className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-gray-900 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  지금 시작하기
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-gray-900/90 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
            <p>&copy; 2026 Parts Monitor. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  )
}
