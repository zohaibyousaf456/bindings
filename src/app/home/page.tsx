"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BarChart3,
  BarChartBigIcon as ChartBarIcon,
  HeartIcon,
  Home,
  Settings,
  SparklesIcon,
  Trash2,
  Users,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface Post {
  id: string
  post: string
  platforms: string[]
  mediaUrls: string[]
  created: string
  status: string
  metrics: {
    likes: number
    comments: number
    shares: number
    reach: number
    engagement: number
  }
}

interface AnalysisResult {
  id: string
  postId: string
  overallScore: number
  hookScore: number
  hookFeedback: string
  captionScore: number
  captionFeedback: string
  topicRelevanceScore: number
  topicRelevanceFeedback: string
  audioTranscription?: string
  createdAt: string
  updatedAt: string
}

interface AnalyticsData {
  audienceGenderAge?: Record<string, number>
  audienceCountry?: Record<string, number>
  audienceCity?: Record<string, number>
  followersCount?: number
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home")
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<"all" | "instagram" | "tiktok">("all")
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  // Follower Insight sub-tab state (Gender | Age | Locations)
  const [followersTab, setFollowersTab] = useState<"gender" | "age" | "locations">("gender")

  // Analytics state for Follower Insight
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      alert("Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,

        },
        body: JSON.stringify({ name: nameInput.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update name");
        return;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, name: data.user.name } : prev);
      setIsEditing(false);
      alert("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Error updating name");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          console.error("No auth token found")
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          console.error("Failed to fetch user data")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true)
        const token = localStorage.getItem("authToken")

        if (!token) {
          console.error("No auth token found")
          return
        }

        const res = await fetch("/api/ayrshare/post-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch posts")
        const data = await res.json()
        setPosts(data.posts || [])
      } catch (err) {
        console.error("Error fetching posts:", err)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Fetch analytics for Follower Insight (instagram by default)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true)
        setAnalyticsError(null)
        const token = localStorage.getItem("authToken")
        if (!token) {
          console.error("No auth token found")
          return
        }

        const res = await fetch("/api/ayrshare/analytics/instagram", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        const payload = data?.analytics?.data as AnalyticsData | undefined
        if (payload) {
          setAnalyticsData(payload)
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setAnalyticsError("Failed to load follower insights")
      } finally {
        setAnalyticsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // Derived breakdowns for Follower Insight
  const genderBreakdown = useMemo(() => {
    const genderAge = analyticsData?.audienceGenderAge || {}
    let male = 0, female = 0, other = 0
    for (const [k, v] of Object.entries(genderAge)) {
      if (k.startsWith("M.")) male += Number(v) || 0
      else if (k.startsWith("F.")) female += Number(v) || 0
      else other += Number(v) || 0
    }
    const total = male + female + other
    if (!total) return { malePct: 0, femalePct: 0, otherPct: 0, male, female, other }
    const malePct = Math.round((male / total) * 100)
    const femalePct = Math.round((female / total) * 100)
    let otherPct = Math.round((other / total) * 100)
    // Adjust to make sure they sum to 100
    const sumPct = malePct + femalePct + otherPct
    if (sumPct !== 100) {
      otherPct += 100 - sumPct
    }
    return { malePct, femalePct, otherPct, male, female, other }
  }, [analyticsData])

  const ageBreakdown = useMemo(() => {
    const genderAge = analyticsData?.audienceGenderAge || {}
    const buckets: Record<string, number> = {}
    for (const [k, v] of Object.entries(genderAge)) {
      const parts = k.split(".")
      const age = parts[1] || "Unknown"
      buckets[age] = (buckets[age] || 0) + (Number(v) || 0)
    }
    const order = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
    const total = Object.values(buckets).reduce((a, b) => a + b, 0)
    const items = Object.entries(buckets)
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([label, value]) => ({ label, value, pct: total ? Math.round((value / total) * 100) : 0 }))
    return items
  }, [analyticsData])

  const countryBreakdown = useMemo(() => {
    const countries = analyticsData?.audienceCountry || {}
    const entries = Object.entries(countries)
    const total = entries.reduce((a, [, v]) => a + (Number(v) || 0), 0)
    const items = entries
      .map(([code, value]) => ({ code, value: Number(value) || 0 }))
      .sort((a, b) => b.value - a.value)
      .map((i) => ({ label: i.code, value: i.value, pct: total ? Math.round((i.value / total) * 100) : 0 }))
      .slice(0, 5)
    return items
  }, [analyticsData])

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const handleAnalyzePost = async () => {
    if (selectedPosts.size === 0) {
      alert("Please select at least one post to analyze")
      return
    }

    const postId = Array.from(selectedPosts)[0] // Analyze first selected post

    try {
      setAnalysisLoading(true)
      const token = localStorage.getItem("authToken")

      if (!token) {
        console.error("No auth token found")
        return
      }

      const res = await fetch("/api/ayrshare/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (!res.ok) throw new Error("Failed to analyze post")
      const data = await res.json()

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis)
        setActiveTab("analysis") // Switch to analysis tab
      } else {
        alert("Analysis failed: " + (data.message || "Unknown error"))
      }
    } catch (err) {
      console.error("Error analyzing post:", err)
      alert("Failed to analyze post")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const getFilteredPosts = () => {
    if (activeFilter === "all") return posts
    // For now, showing all posts in each tab as requested
    // In the future, you can filter by platform when the data structure supports it
    return posts
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found")
        return
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove token from localStorage
        localStorage.removeItem("authToken")
        // Redirect to login page
        window.location.href = "/login"
      } else {
        const data = await response.json()
        alert(data.message || "Failed to logout")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      alert("An error occurred during logout")
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.")

    if (!confirmed) return

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found")
        return
      }

      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove token from localStorage
        localStorage.removeItem("authToken")
        alert("Account deleted successfully")
        // Redirect to signup page
        window.location.href = "/signup"
      } else {
        const data = await response.json()
        alert(data.message || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error during account deletion:", error)
      alert("An error occurred while deleting account")
    }
  }

  const renderHomeScreen = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6">
        {/* Left side: Hello + Name */}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0%",
              verticalAlign: "middle",
            }}
            className="text-gray-900"
          >
            Hello 👋
          </span>
          <span
            className="
    font-semibold              /* bold text */
    text-lg md:text-xl lg:text-2xl  /* increase font size as screen gets larger */
    text-gray-900              /* text color */
    font-inter                 /* ensure Inter is applied if you've set it in Tailwind */
  "
          >
            {loading ? "Loading..." : user?.name || "Guest"}
          </span>
        </div>

        {/* Right side: Profile Icon */}
        <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden relative hover:scale-105 transition-transform duration-200 cursor-pointer">
          <Image src="/imagetest.png" alt="Profile" fill className="object-cover" priority />
        </div>
      </div>

      <div className="px-4 lg:px-8 mb-4 md:mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 max-w-none">
          {/* Stats Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-4 md:p-5 lg:p-6 w-full h-auto flex flex-col justify-around hover:shadow-lg hover:border-gray-200 transition-all duration-300">
            {/* Row 1 - Posts Analyzed */}
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[49px] bg-[#E9EEF0] rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex flex-col">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">12</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Posts Analyzed</div>
              </div>
            </div>

            {/* Row 2 - Avg. Engagement */}
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[49px] bg-[#E9EEF0] rounded-full flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex flex-col">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">4.2%</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Avg. Engagement</div>
              </div>
            </div>

            {/* Row 3 - Improvement */}
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
              <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[49px] bg-[#E9EEF0] rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex flex-col">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">+23%</div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Improvement</div>
              </div>
            </div>
          </div>

          {/* Connected Accounts Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-4 md:p-5 lg:p-6 w-full h-auto flex flex-col gap-4 md:gap-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
            {/* Header */}
            <div>
              <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 mb-1">
                Connected Accounts
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-500">
                Connect your social media accounts to import and analyze your posts
              </p>
            </div>

            {/* Accounts */}
            <div className="flex flex-col gap-2 md:gap-3">
              {/* Instagram */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[49px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center px-4 hover:scale-110 transition-transform duration-200">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.668.072-4.948.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Instagram</span>
                </div>
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer" />
              </div>

              {/* TikTok */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[49px] rounded-full bg-black flex items-center justify-center px-4 hover:scale-110 transition-transform duration-200">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">TikTok</span>
                </div>
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 mb-4 md:mb-6">
        <div className="bg-white border border-gray-100 rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-none h-auto flex flex-col gap-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          {/* Header */}
          <div>
            <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 mb-1">
              Your Recent Posts
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-gray-500">
              Select posts to analyze and get AI-powered feedback
            </p>
          </div>

          <div className="flex gap-2 md:gap-3 mb-2 flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 text-xs md:text-sm lg:text-base rounded-full font-medium transition-colors duration-200 ${
                activeFilter === "all"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All {posts.length}
            </button>
            <button
              onClick={() => setActiveFilter("instagram")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 text-xs md:text-sm lg:text-base font-medium flex items-center gap-1 rounded-full transition-colors duration-200 ${
                activeFilter === "instagram"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <svg
                  className="w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              Instagram ({posts.length})
            </button>
            <button
              onClick={() => setActiveFilter("tiktok")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 text-xs md:text-sm lg:text-base font-medium flex items-center gap-1 rounded-full transition-colors duration-200 ${
                activeFilter === "tiktok"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-black flex items-center justify-center">
                <svg
                  className="w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              TikTok ({posts.length})
            </button>
          </div>

          {postsLoading ? (
            <p className="text-gray-500 text-sm">Loading posts...</p>
          ) : getFilteredPosts().length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {getFilteredPosts().map((post) => (
                <div
                  key={post.id}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    selectedPosts.has(post.id) ? "ring-2 ring-purple-500 scale-105" : "hover:scale-105"
                  }`}
                  onClick={() => togglePostSelection(post.id)}
                >
                  <Image
                    src={post.mediaUrls?.[0] || "/imagetest.png"}
                    alt="Post thumbnail"
                    fill
                    className="object-cover"
                  />
                  {/* Selection checkbox */}
                  <div className="absolute top-2 right-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedPosts.has(post.id) ? "bg-purple-500" : "bg-black/60"
                      }`}
                    >
                      {selectedPosts.has(post.id) ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  {/* Platform Badge */}
                  <div className="absolute top-2 left-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/60">
                      <span className="text-[10px] text-white">{(post.platforms?.[0]?.[0] || "?").toUpperCase()}</span>
                    </div>
                  </div>
                  {/* Likes & Comments */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-white text-xs font-medium">
                    <span className="bg-black bg-opacity-50 px-1 rounded">♥ {post.metrics?.likes || 0}</span>
                    <span className="bg-black bg-opacity-50 px-1 rounded">💬 {post.metrics?.comments || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          onClick={handleAnalyzePost}
          className={`mt-3 md:mt-4 p-3 md:p-4 lg:p-5 rounded-xl flex items-center justify-between max-w-none transition-colors duration-200 cursor-pointer ${
            selectedPosts.size > 0 && !analysisLoading
              ? "bg-gray-900 hover:bg-gray-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center gap-2 text-white">
            <div
              className={`w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded flex items-center justify-center transition-colors duration-200 ${
                selectedPosts.size > 0 && !analysisLoading ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-500"
              }`}
            >
              {analysisLoading ? (
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-xs md:text-sm lg:text-base">✨</span>
              )}
            </div>
            <span className="text-sm md:text-base lg:text-lg font-medium">
              {analysisLoading
                ? "Analyzing..."
                : selectedPosts.size > 0
                  ? `Analyse ${selectedPosts.size} post${selectedPosts.size > 1 ? "s" : ""}`
                  : "Select posts to analyze"}
            </span>
          </div>
          <svg
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )

  const renderAnalysisScreen = () => (
    <div className="flex-1 overflow-y-auto bg-[#eaeef1] flex flex-col items-start pt-8 px-5 lg:px-8">
      <h2 className="mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-900">Analysis</h2>

      {analysisResult ? (
        <div className="bg-white rounded-[24px] flex flex-col gap-6 md:gap-8 w-full max-w-[353px] lg:max-w-2xl xl:max-w-4xl p-4 md:p-5 lg:p-6 xl:p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          {/* Overall Score */}
          <div className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {analysisResult.overallScore}%
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Overall Score</div>
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-gray-600">
              Your post is performing better than {analysisResult.overallScore}% of your content! Keep it up!
            </p>
          </div>

          {/* Hook */}
          <div className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {analysisResult.hookScore}%
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Hook</div>
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-gray-600">{analysisResult.hookFeedback}</p>
          </div>

          {/* Caption */}
          <div className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {analysisResult.captionScore}%
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Caption</div>
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-gray-600">{analysisResult.captionFeedback}</p>
          </div>

          {/* Topic Relevance */}
          <div className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  {analysisResult.topicRelevanceScore}%
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-500">Topic Relevance</div>
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-gray-600">{analysisResult.topicRelevanceFeedback}</p>
          </div>

          {/* Audio Transcription if available */}
          {analysisResult.audioTranscription && (
            <div className="hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200">
              <h4 className="font-semibold text-gray-900 mb-2">Audio Transcription</h4>
              <p className="text-xs md:text-sm lg:text-base text-gray-600">{analysisResult.audioTranscription}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[24px] flex flex-col gap-6 md:gap-8 w-full max-w-[353px] lg:max-w-2xl xl:max-w-4xl p-4 md:p-5 lg:p-6 xl:p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h3>
            <p className="text-gray-500 mb-4">
              Select posts from the home tab and click analyze to see detailed insights here.
            </p>
            <button
              onClick={() => setActiveTab("home")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderAudienceScreen = () => (
    <div className="flex-1 overflow-y-auto bg-[#eaeef1] px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-900">Audience</h2>

        <button className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full">
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export
        </button>
      </div>

      <div className="space-y-2">
        {/* Profile Card */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            {/* Left side: Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 lg:w-14 lg:h-14 rounded-full overflow-hidden relative hover:scale-105 transition-transform duration-200">
                <Image src="/imagetest.png" alt="Profile" fill className="object-cover" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-xl md:text-2xl lg:text-3xl">
                  {loading ? "Loading..." : user?.name || "Guest"}
                </div>
                <div className="text-gray-500 text-sm md:text-base lg:text-lg">
                  {loading ? "Loading..." : user?.email || "No email"}
                </div>
              </div>
            </div>
          </div>

          {/* Followers button + icons in one row */}
          <div className="flex items-center justify-between">
            {/* Followers button (left) */}
            <div className="flex items-center gap-2 bg-blue-50 rounded-full px-3 md:px-4 py-2 hover:bg-blue-100 transition-colors duration-200">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span className="text-xs md:text-sm text-gray-900 font-medium">12.69k followers</span>
            </div>

            {/* Social icons (right) */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <div className="w-7 h-7 md:w-8 md:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.668.072-4.948.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-9 lg:w-10 lg:h-10 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Follower Insight Card */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg lg:text-xl">Follower Insight</h3>

          {/* Tabs */}
          <div className="flex gap-6 md:gap-8 mb-6">
            <button
              onClick={() => setFollowersTab("gender")}
              className={`text-sm md:text-base font-medium pb-1 transition-colors duration-200 ${
                followersTab === "gender" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Gender
            </button>
            <button
              onClick={() => setFollowersTab("age")}
              className={`text-sm md:text-base pb-1 transition-colors duration-200 ${
                followersTab === "age" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Age
            </button>
            <button
              onClick={() => setFollowersTab("locations")}
              className={`text-sm md:text-base pb-1 transition-colors duration-200 ${
                followersTab === "locations" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Locations
            </button>
          </div>

          {analyticsLoading ? (
            <p className="text-gray-500 text-sm">Loading follower insights...</p>
          ) : analyticsError ? (
            <p className="text-red-500 text-sm">{analyticsError}</p>
          ) : !analyticsData ? (
            <p className="text-gray-500 text-sm">No follower insights available.</p>
          ) : (
            <>
              {followersTab === "gender" && (
                <>
                  {/* Donut Chart */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                      <svg className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 transform -rotate-90" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
                        {/* Male */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="6"
                          strokeDasharray={`${genderBreakdown.malePct} ${100 - genderBreakdown.malePct}`}
                          strokeLinecap="round"
                        />
                        {/* Female */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#93c5fd"
                          strokeWidth="6"
                          strokeDasharray={`${genderBreakdown.femalePct} ${100 - genderBreakdown.femalePct}`}
                          strokeDashoffset={`-${genderBreakdown.malePct}`}
                          strokeLinecap="round"
                        />
                        {/* Other */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#9ca3af"
                          strokeWidth="6"
                          strokeDasharray={`${genderBreakdown.otherPct} ${100 - genderBreakdown.otherPct}`}
                          strokeDashoffset={`-${genderBreakdown.malePct + genderBreakdown.femalePct}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm md:text-base text-gray-900">Male</span>
                      </div>
                      <span className="text-sm md:text-base font-medium text-gray-900">{genderBreakdown.malePct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                        <span className="text-sm md:text-base text-gray-900">Female</span>
                      </div>
                      <span className="text-sm md:text-base font-medium text-gray-900">{genderBreakdown.femalePct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm md:text-base text-gray-900">Other</span>
                      </div>
                      <span className="text-sm md:text-base font-medium text-gray-900">{genderBreakdown.otherPct}%</span>
                    </div>
                  </div>
                </>
              )}

              {followersTab === "age" && (
                <div className="space-y-3">
                  {ageBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-sm">No age data available.</p>
                  ) : (
                    ageBreakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <span className="text-sm md:text-base text-gray-900">{item.label}</span>
                        </div>
                        <span className="text-sm md:text-base font-medium text-gray-900">{item.pct}%</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {followersTab === "locations" && (
                <div className="space-y-3">
                  {countryBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-sm">No location data available.</p>
                  ) : (
                    countryBreakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-sm md:text-base text-gray-900">{item.label}</span>
                        </div>
                        <span className="text-sm md:text-base font-medium text-gray-900">{item.pct}%</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Most Active Times Card */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg lg:text-xl">Most Active Times</h3>

          {/* Bar Graph */}
          <div className="relative h-40 md:h-48 lg:h-56 mb-4">
            {/* Y-axis values */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-xs md:text-sm text-gray-400">
              {[52, 39, 26, 13, 0].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end justify-between h-full pr-6 gap-2">
              {[
                { time: "12a", height: 20, value: 0 },
                { time: "4a", height: 50, value: 13 },
                { time: "8a", height: 90, value: 26 },
                { time: "9a", height: 140, value: 52, isActive: true },
                { time: "12p", height: 110, value: 39 },
                { time: "4p", height: 80, value: 26 },
                { time: "8p", height: 40, value: 13 },
              ].map((item) => (
                <div key={item.time} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-4 md:w-6 lg:w-8 rounded-t-lg ${item.isActive ? "bg-green-500" : "bg-green-400"}`}
                    style={{ height: `${item.height}px` }}
                  ></div>
                  <span className="text-xs md:text-sm text-gray-500 mt-1">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          <div className="text-center">
            <div className="text-sm md:text-base text-gray-600">
              <span className="font-medium">9am</span>
            </div>
            <div className="text-xs md:text-sm text-gray-500">0 Followers</div>
          </div>
        </div>

        {/* Languages Card */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg lg:text-xl">Languages</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
              <span className="text-sm md:text-base text-gray-900">English</span>
              <span className="text-sm md:text-base font-medium text-gray-900">89%</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
              <span className="text-sm md:text-base text-gray-900">Spanish</span>
              <span className="text-sm md:text-base font-medium text-gray-900">7%</span>
            </div>
            <div className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
              <span className="text-sm md:text-base text-gray-900">Other</span>
              <span className="text-sm md:text-base font-medium text-gray-900">4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsScreen = () => (
    <div className="flex-1 overflow-y-auto bg-[#eaeef1] px-4 py-4 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-900">Account Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl items-stretch">
        {/* Profile Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 h-full flex flex-col">
          {/* Header with Edit button */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-base md:text-lg">Profile Information</h3>
            <button
  onClick={async () => {
    if (isEditing) {
      // Save the updated name
      await handleSaveName();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  }}
  className="flex items-center border border-gray-200 rounded-full py-1 px-3 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 mr-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687 1.687a1.875 1.875 0 010 2.652l-8.955 8.955a4.5 4.5 0 01-1.897 1.13l-3.316.95a.75.75 0 01-.927-.927l.95-3.316a4.5 4.5 0 011.13-1.897l8.955-8.955a1.875 1.875 0 012.652 0z"
    />
  </svg>
  {isEditing ? "Save" : "Edit"}
</button>

          </div>

          {/* Profile fields */}
          <div className="space-y-3 mb-5 flex-1">
            <div className="flex items-center justify-between">
  <span className="text-sm md:text-base text-gray-600">Name</span>
  {isEditing ? (
    <input
      type="text"
      value={nameInput}
      onChange={(e) => setNameInput(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base font-semibold text-gray-900"
      maxLength={20}
    />
  ) : (
    <span className="text-sm md:text-base font-semibold text-gray-900">
      {loading ? "Loading..." : user?.name || "Guest"}
    </span>
  )}
</div>

            <div className="flex items-center justify-between">
              <span className="text-sm md:text-base text-gray-600">Email</span>
              <span className="text-sm md:text-base font-semibold text-gray-900">
                {loading ? "Loading..." : user?.email || "guest@example.com"}
              </span>
            </div>
          </div>

          {/* Change Password button */}
          <button
            onClick={handleChangePassword}
            className="w-full border border-purple-500 text-purple-600 rounded-full py-2 text-sm md:text-base font-medium hover:bg-purple-50 transition-colors duration-200"
          >
            Change Password
          </button>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 mb-2 lg:mb-0 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Connected Accounts</h3>

          <div className="space-y-3 flex flex-col items-center flex-1">
            <button className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-between gap-[20px] px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-gray-300 text-xs md:text-sm text-gray-900 opacity-100 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                  <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.668.072-4.948.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-gray-900">Instagram</span>
              </div>
            </button>

            <button className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-between gap-[20px] px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-gray-300 text-xs md:text-sm text-gray-900 opacity-100 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform duration-200">
                  <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-gray-900">Tiktok</span>
              </div>
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 h-full flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Subscription</h3>

          <div className="mb-5 flex-1">
            <p className="text-xs md:text-sm text-gray-500 mb-2">You’re currently on the Free Plan</p>

            {/* Progress bar section */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs md:text-sm text-gray-700">Analysis remaining</span>
                <span className="text-xs md:text-sm font-medium text-gray-900">40/100</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>

          {/* Upgrade button */}
          <button className="w-full border border-purple-500 text-purple-600 rounded-full py-2 text-sm md:text-base font-medium hover:bg-purple-50 transition-colors duration-200">
            Upgrade Plan
          </button>
        </div>

        {/* Support & Help */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 mb-2 lg:mb-0 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Support & Help</h3>

          <div className="space-y-3 flex flex-col items-center flex-1">
            <button className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-center px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-gray-300 text-xs md:text-sm text-gray-900 opacity-100 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              Help Center
            </button>
            <button className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-center px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-gray-300 text-xs md:text-sm text-gray-900 opacity-100 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              Contact Support
            </button>
          </div>
        </div>

        {/* Account Actions - spans full width on desktop */}
        <div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 mb-2 lg:mb-0 lg:col-span-2 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg">Account Actions</h3>

          <div className="flex flex-col lg:flex-row gap-3 items-center justify-center">
            <button
              onClick={handleLogout}
              className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-center px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-gray-300 text-xs md:text-sm text-gray-900 opacity-100 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Sign Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full max-w-[313px] h-[44px] md:h-[52px] flex items-center justify-center px-3 md:px-4 py-[12px] md:py-[16px] rounded-[16px] border border-red-300 text-xs md:text-sm text-red-500 opacity-100 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const handleChangePassword = () => {
    {router.push("/change-password");};
  }

  return (
    <div className="min-h-screen bg-[#eaeef1] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden relative hover:scale-105 transition-transform duration-200">
              <Image src="/imagetest.png" alt="Profile" fill className="object-cover" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm lg:text-base">
                {loading ? "Loading..." : user?.name || "Guest"}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                {loading ? "Loading..." : user?.email || "No email"}
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm lg:text-base">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("analysis")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                activeTab === "analysis"
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm lg:text-base">Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab("audience")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                activeTab === "audience"
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm lg:text-base">Audience</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                activeTab === "settings"
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm lg:text-base">Settings</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Content */}
        {activeTab === "home" && renderHomeScreen()}
        {activeTab === "analysis" && renderAnalysisScreen()}
        {activeTab === "audience" && renderAudienceScreen()}
        {activeTab === "settings" && renderSettingsScreen()}

        <div className="lg:hidden border-t border-gray-200 px-6 py-2 bg-white rounded-t-[24px]">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 py-2 transition-all duration-200 ${
                activeTab === "home" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1H3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-xs">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex flex-col items-center gap-1 py-2 transition-all duration-200 ${
                activeTab === "analysis" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-xs">Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab("audience")}
              className={`flex flex-col items-center gap-1 py-2 transition-all duration-200 ${
                activeTab === "audience" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span className="text-xs">Audience</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center gap-1 py-2 transition-all duration-200 ${
                activeTab === "settings" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden flex justify-center pb-2 bg-[#eaeef1]">
          <div className="w-32 h-1 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

