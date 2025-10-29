"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { Calendar, Clock, Utensils, Check, Ticket, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for the mess menu
const generateMenuData = () => {
  const today = new Date()
  const mealTypes = ["Breakfast", "Lunch", "Dinner"]

  const breakfastItems = [
    [
      "Bread, Butter, Jam, Eggs",
      "Cornflakes, Milk, Fruits",
      "Idli, Sambar, Chutney",
      "Poha, Tea, Fruits",
      "Paratha, Curd, Pickle",
      "Upma, Coconut Chutney",
      "Pancakes, Maple Syrup",
    ],
    ["Tea, Coffee", "Tea, Coffee", "Tea, Coffee", "Tea, Coffee", "Tea, Coffee", "Tea, Coffee", "Tea, Coffee"],
  ]

  const lunchItems = [
    ["Rice, Dal", "Rice, Rajma", "Rice, Kadhi", "Rice, Chole", "Rice, Dal Makhani", "Rice, Sambar", "Rice, Dal Tadka"],
    [
      "Roti, Vegetable Curry",
      "Roti, Mix Veg",
      "Roti, Aloo Gobi",
      "Roti, Paneer Butter Masala",
      "Roti, Bhindi Fry",
      "Roti, Vegetable Korma",
      "Roti, Matar Paneer",
    ],
    ["Salad, Papad", "Salad, Pickle", "Salad, Papad", "Salad, Pickle", "Salad, Papad", "Salad, Pickle", "Salad, Raita"],
  ]

  const dinnerItems = [
    [
      "Rice, Dal Fry",
      "Rice, Chana Dal",
      "Rice, Moong Dal",
      "Rice, Masoor Dal",
      "Rice, Toor Dal",
      "Rice, Dal Tadka",
      "Rice, Mixed Dal",
    ],
    [
      "Roti, Vegetable Curry",
      "Roti, Aloo Matar",
      "Roti, Palak Paneer",
      "Roti, Mixed Vegetables",
      "Roti, Malai Kofta",
      "Roti, Baingan Bharta",
      "Roti, Paneer Tikka Masala",
    ],
    ["Salad, Curd", "Salad, Raita", "Salad, Curd", "Salad, Raita", "Salad, Curd", "Salad, Raita", "Sweet Dish"],
  ]

  return Array(7)
    .fill(null)
    .map((_, index) => {
      const date = addDays(today, index)
      const dayName = format(date, "EEEE")
      const dateStr = format(date, "dd MMM yyyy")

      const meals = mealTypes.map((type) => {
        let items
        if (type === "Breakfast") {
          items = breakfastItems.map((category) => category[index])
        } else if (type === "Lunch") {
          items = lunchItems.map((category) => category[index])
        } else {
          items = dinnerItems.map((category) => category[index])
        }

        return {
          type,
          items,
        }
      })

      return {
        id: index,
        dayName,
        date: dateStr,
        meals,
      }
    })
}

export default function MessManagement() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const menuData = generateMenuData()
  const [selectedDay, setSelectedDay] = useState(menuData[0].id.toString())
  const [attendance, setAttendance] = useState<Record<string, Record<string, boolean>>>({})
  const [couponOpen, setCouponOpen] = useState(false)
  const [currentCoupon, setCurrentCoupon] = useState({ day: "", meal: "", code: "" })

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem("isAuthenticated")
    const userData = localStorage.getItem("user")

    if (authStatus === "true" && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleAttendanceChange = (dayId: number, mealType: string, value: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] || {}),
        [mealType]: value,
      },
    }))
  }

  const generateCoupon = (dayId: number, mealType: string) => {
    const day = menuData.find((d) => d.id === dayId)
    if (!day) return

    const couponCode = `MESS-${day.dayName.substring(0, 3).toUpperCase()}-${mealType.substring(0, 1)}${Math.floor(1000 + Math.random() * 9000)}`

    setCurrentCoupon({
      day: day.dayName,
      meal: mealType,
      code: couponCode,
    })

    setCouponOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">College Mess Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{user?.name || user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          {menuData.map((day) => (
            <TabsTrigger key={day.id} value={day.id.toString()} className="flex flex-col items-center py-2">
              <span className="font-medium">{day.dayName.substring(0, 3)}</span>
              <span className="text-xs text-muted-foreground">{day.date.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {menuData.map((day) => (
          <TabsContent key={day.id} value={day.id.toString()} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                {day.dayName}, {day.date}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {day.meals.map((meal, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        {meal.type}
                      </CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.type === "Breakfast"
                          ? "7:30 - 9:30 AM"
                          : meal.type === "Lunch"
                            ? "12:30 - 2:30 PM"
                            : "7:30 - 9:30 PM"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {meal.type === "Breakfast"
                        ? "Start your day right"
                        : meal.type === "Lunch"
                          ? "Midday nourishment"
                          : "Evening meal"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {meal.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="bg-primary/10 text-primary p-1 rounded-full mt-0.5">
                            <Utensils className="h-3 w-3" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`attendance-${day.id}-${meal.type}`}
                        checked={attendance[day.id]?.[meal.type] || false}
                        onCheckedChange={(value) => handleAttendanceChange(day.id, meal.type, value)}
                      />
                      <Label htmlFor={`attendance-${day.id}-${meal.type}`}>I'll be attending</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!attendance[day.id]?.[meal.type]}
                      onClick={() => generateCoupon(day.id, meal.type)}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Get Coupon
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Digital Meal Coupon</DialogTitle>
            <DialogDescription>Present this coupon at the mess counter to claim your meal.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/30 my-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                {currentCoupon.day} - {currentCoupon.meal}
              </h3>
              <p className="text-sm text-muted-foreground">Valid for today only</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-md px-6 py-3 font-mono text-xl font-bold tracking-wider text-primary">
              {currentCoupon.code}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span>Single use only. Non-transferable.</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <Button variant="outline" onClick={() => setCouponOpen(false)} className="sm:w-auto w-full">
              Close
            </Button>
            <Button
              className="sm:w-auto w-full"
              onClick={() => {
                // In a real app, this would save or print the coupon
                setCouponOpen(false)
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
