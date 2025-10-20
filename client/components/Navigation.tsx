// import { Link, useLocation } from 'react-router-dom';
// import { User } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext';

// interface NavigationProps {
//   onLoginClick: () => void;
// }

// export default function Navigation({ onLoginClick }: NavigationProps) {
//   const location = useLocation();
//   const { user } = useAuth();

//   const navItems = [
//   { path: '/', label: 'Home' },
//   { path: '/contact', label: 'Contact' },
//   { path: '/offers', label: 'Offers' },
//   { path: '/cart', label: 'Cart' },
//   { path: '/courses', label: 'Courses' },
//   ];

//   const authenticatedNavItems = [
//     { path: '/orders', label: 'Orders' },
//   ];

//   return (
//     <nav className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-30" style={{ top: '80px' }}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between">
//           <div className="flex space-x-8">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//             {user && authenticatedNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Login Button for Mobile */}
//           {!user && (
//             <button
//               onClick={onLoginClick}
//               className="md:hidden flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
//             >
//               <User className="w-4 h-4" />
//               <span>Login</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }



// import { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { User, Menu, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/contexts/AuthContext";

// interface NavigationProps {
//   onLoginClick: () => void;
// }

// export default function Navigation({ onLoginClick }: NavigationProps) {
//   const location = useLocation();
//   const { user } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);

//   const navItems = [
//     { path: "/", label: "Home" },
//     { path: "/contact", label: "Contact" },
//     { path: "/offers", label: "Offers" },
//     { path: "/cart", label: "Cart" },
//     { path: "/courses", label: "Courses" },
//   ];

//   const authenticatedNavItems = [{ path: "/orders", label: "Orders" }];

//   const allNavItems = user ? [...navItems, ...authenticatedNavItems] : navItems;

//   return (
//     <nav className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-30" style={{ top: "80px" }}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between py-3">
//           {/* Logo placeholder (optional) */}
//           {/* <div className="text-lg font-bold text-pink-600">MySite</div> */}

//           {/* Desktop Menu */}
//           <div className="hidden md:flex space-x-6">
//             {allNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "py-2 px-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 border-pink-500 bg-pink-50"
//                     : "text-gray-700 hover:bg-pink-25"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Right section */}
//           <div className="flex items-center space-x-3">
//             {!user && (
//               <button
//                 onClick={onLoginClick}
//                 className="hidden md:flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
//               >
//                 <User className="w-4 h-4" />
//                 <span>Login</span>
//               </button>
//             )}

//             {/* Mobile menu button */}
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600"
//             >
//               {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Dropdown */}
//         {isOpen && (
//           <div className="md:hidden flex flex-col space-y-1 pb-3">
//             {allNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 onClick={() => setIsOpen(false)} // close menu after click
//                 className={cn(
//                   "block py-2 px-4 text-sm font-medium transition-all duration-200 border-b border-gray-200 hover:bg-pink-50 hover:text-pink-600",
//                   location.pathname === item.path
//                     ? "text-pink-600 bg-pink-50"
//                     : "text-gray-700"
//                 )}
//               >
//                 {item.label}
//               </Link>
//             ))}

//             {!user && (
//               <button
//                 onClick={() => {
//                   onLoginClick();
//                   setIsOpen(false);
//                 }}
//                 className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600"
//               >
//                 <User className="w-4 h-4" />
//                 <span>Login</span>
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }


import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  onLoginClick: () => void;
}

interface NavItem {
  path: string;
  label: string;
  hidden?: boolean;
}

export default function Navigation({ onLoginClick }: NavigationProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: "/", label: "Home" },
    { path: "/contact", label: "Contact" },
    { path: "/offers", label: "Offers", hidden: true },
    { path: "/cart", label: "Cart" },
    { path: "/courses", label: "Courses" },
  ];

  const authenticatedNavItems: NavItem[] = [{ path: "/orders", label: "Orders" }];

  const allNavItems = user ? [...navItems, ...authenticatedNavItems] : navItems;

  return (
    <nav
      className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 shadow-sm fixed left-0 right-0 z-50"
      style={{ top: "80px" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "py-2 px-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-pink-400 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 border-pink-500 bg-pink-50"
                    : "text-gray-700 hover:bg-pink-25",
                  item.hidden && "!hidden"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {!user && (
              <button
                onClick={onLoginClick}
                className="hidden md:flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-1 pb-3 bg-white shadow-lg relative z-50">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // close menu after click
                className={cn(
                  "block py-2 px-4 text-sm font-medium transition-all duration-200 border-b border-gray-200 hover:bg-pink-50 hover:text-pink-600",
                  location.pathname === item.path
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700",
                  item.hidden && "!hidden"
                )}
              >
                {item.label}
              </Link>
            ))}

            {!user && (
              <button
                onClick={() => {
                  onLoginClick();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-700 hover:text-pink-600"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
