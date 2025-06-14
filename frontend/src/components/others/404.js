import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Home, Search, Phone, Mail, MapPin, Fuel, Users, Calendar } from "lucide-react"
import Link from "next/link"

const CarRental404 = () => {
    const popularCars = [
        { name: "Economy Cars", icon: Car, count: "50+ available" },
        { name: "SUVs", icon: Car, count: "30+ available" },
        { name: "Luxury Cars", icon: Car, count: "15+ available" },
        { name: "Electric Cars", icon: Car, count: "20+ available" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <Car className="w-24 h-24 text-blue-600" />
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                !
                            </div>
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold text-gray-800 mb-4">
                        4<span className="text-blue-600">0</span>4
                    </h1>

                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Wrong Turn</h2>

                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Looks like you've taken a detour. The page you're looking for doesn't exist, but we can help you get back on
                        the road!
                    </p>
                </div>

                {/* Search Section */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-center">Find Your Perfect Rental Car</h3>
                        <div className="flex gap-2 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input placeholder="Search for cars, locations..." className="pl-10" />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Popular Categories */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {popularCars.map((category, index) => {
                        const IconComponent = category.icon
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-800 mb-1">{category.name}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {category.count}
                                    </Badge>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg">
                        <Link href="/cars">
                            <Car className="w-4 h-4 mr-2" />
                            Browse Cars
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg">
                        <Link href="/locations">
                            <MapPin className="w-4 h-4 mr-2" />
                            Find Locations
                        </Link>
                    </Button>
                </div>

                {/* Quick Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    

                    <div className="text-center">
                        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">24/7 Support</h4>
                        <p className="text-sm text-gray-600">Always here to help</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">Flexible Booking</h4>
                        <p className="text-sm text-gray-600">Easy cancellation</p>
                    </div>
                </div>

                {/* Contact Info */}
                <Card className="bg-gray-50">
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">1-800-RENT-CAR</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">support@rentcar.com</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>© 2024 RentCar. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}
export default CarRental404;