"use client"
import React, { FC } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"

const Header: FC = () => {
  const router = useRouter()

  const handleNavigate = (href: string) => {
    router.push(href)
  }
  return (
    <div className="flex flex-row p-2 justify-between items-center w-full top-0 left-0 bg-gradient-to-r from-yellow-100 to-yellow-300 shadow-md">
      <div className="flex flex-row gap-2 items-center">
        <Avatar className="w-[48px] h-[48px]">
          <AvatarImage src="https://res.cloudinary.com/dnumk8kl0/image/upload/v1755845882/logo_ywarix.png" />
        </Avatar>
        <span className="font-sans text-sm md:text-xl md:flex font-semibold text-yellow-900">ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ</span>
      </div>
      <div className="flex flex-row gap-2 hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'hover:bg-white/30 rounded-md text-base text-yellow-900')}>
                <Link href="/#posts">ಪೋಸ್ಟ್</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'hover:bg-white/30 rounded-md text-base text-yellow-900')}>
                <Link href="/#gallery">ಗ್ಯಾಲರಿ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'hover:bg-white/30 rounded-md text-base text-yellow-900')}>
                <Link href="/#history">ಇತಿಹಾಸ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'hover:bg-white/30 rounded-md text-base text-yellow-900')}>
                <Link href="/#renovation">ಜೀರ್ಣೋದ್ಧಾರ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Sheet>
        <SheetTrigger className="md:hidden">
          <div className="flex md:hidden bg-yellow-100 border-2 border-yellow-200 p-2 rounded-md hover:bg-yellow-300">
            <Menu size={16} />
          </div>
        </SheetTrigger>

        <SheetContent className="w-1/2 bg-yellow-50 animate-in slide-in-from-right-80 duration-300">
          <SheetHeader>
            <SheetTitle className="sr-only">Mobile Navbar</SheetTitle>
            <SheetDescription className="sr-only">
              Om Namah Shivaya
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col w-full gap-2">
            <SheetClose asChild>
              <Button
                className="flex w-full border border-yellow-200 bg-yellow-100  hover:bg-white/30 rounded-md text-base text-yellow-900"
                onClick={() => handleNavigate("/#posts")}
              >
                ಪೋಸ್ಟ್
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                className="flex w-full border border-yellow-200 bg-yellow-100  hover:bg-white/30 rounded-md text-base text-yellow-900"
                onClick={() => handleNavigate("/#gallery")}
              >
                ಗ್ಯಾಲರಿ
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                className="flex w-full border border-yellow-200 bg-yellow-100 hover:bg-white/30 text-base text-yellow-900"
                onClick={() => handleNavigate("/#history")}
              >
                ಇತಿಹಾಸ
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                className="flex w-full border border-yellow-200 bg-yellow-100  hover:bg-white/30 rounded-md text-base text-yellow-900"
                onClick={() => handleNavigate("/#renovation")}
              >
                ಜೀರ್ಣೋದ್ಧಾರ
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Header;