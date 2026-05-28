import React, { useState } from 'react'
import { Menu, User, LogOut, ChevronDown, Clock, MapPin, Store, CheckCircle2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateUserShop } from '../../store/slices/authSlice'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { MOCK_SHOPS } from '../../data/mockData'

const Header = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isShopSelectOpen, setIsShopSelectOpen] = useState(false)

  React.useEffect(() => {
    // Auto-open shop select for promoters if they haven't selected one yet
    if (user?.role === 'Promoter' && !user?.shopId) {
      setIsShopSelectOpen(true)
    }
  }, [user])

  const handleShopSelect = (shop) => {
    dispatch(updateUserShop({ shopId: shop.id, shopName: shop.name }))
    setIsShopSelectOpen(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return user.name.substring(0, 2).toUpperCase()
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const handleLogout = () => {
    dispatch(logout())
    sessionStorage.removeItem('shopSelectedAutoOpened')
    navigate('/login')
  }

  const handleProfileClick = () => {
    if (user?.role === 'Supervisor') {
      navigate('/supervisor/profile')
    } else if (user?.role === 'Promoter') {
      navigate('/promoter/profile')
    } else {
      navigate('/profile')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-4 md:gap-6">
            {user?.role === 'Promoter' && (
              <button
                onClick={() => setIsShopSelectOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                title={user?.shopName || "Select Shop"}
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline max-w-[150px] truncate">{user?.shopName || "Select Shop"}</span>
              </button>
            )}
            <button
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={`group flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border-2 active:scale-95 ${
                isCheckedIn 
                  ? 'bg-red-200 text-black border-red-200 hover:border-red-400 hover:bg-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.3)]'
                  : 'bg-emerald-200 text-black border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 shadow-[0_2px_10px_-3px_rgba(34,197,94,0.3)]'
              }`}
            >
              <Clock className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isCheckedIn ? 'rotate-180 text-black' : 'text-black animate-[spin_3s_linear_infinite]'}`} />
              <span className="tracking-wide">{isCheckedIn ? 'Check Out' : 'Check In'}</span>
            </button>
            <DropdownMenu
              trigger={
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="h-10 w-10 rounded-full bg-[#433228] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name || user.username}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                    {user.shopName && (
                      <p className="text-xs text-gray-400">{user.shopName}</p>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
                </div>
              }
            >
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Select Shop Dialog */}
      <Dialog open={isShopSelectOpen} onOpenChange={setIsShopSelectOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Select Shop</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto max-h-[60vh] p-1">
            {MOCK_SHOPS.map((shop) => {
              const isActive = user?.shopId === shop.id;
              return (
                <div
                  key={shop.id}
                  onClick={() => handleShopSelect(shop)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isActive 
                      ? 'border-[#433228] bg-[#433228] shadow-sm' 
                      : 'border-gray-200 hover:border-[#433228] bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {shop.name}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#433228] bg-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className={`flex items-start gap-1.5 text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="line-clamp-2">{shop.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default Header
