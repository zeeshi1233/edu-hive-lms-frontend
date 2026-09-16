import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { sidebarMenu } from "../sideBarData/sidebarMenu";
import { useAuth } from "../context/AppContext";
import axiosInstance from "../api/axiosInstance";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const { user, role, logout, logoutLoading } = useAuth();
  const [meUser, setMeUser] = useState(null);

  useEffect(() => {
    // Fetch logged in user profile dynamically
    axiosInstance
      .get("/api/auth/me")
      .then((res) => {
        if (res.data?.user) setMeUser(res.data.user);
      })
      .catch(() => {});
  }, []);

  const currentUser = meUser || user;

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn"
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link
            to="/"
            className="sidebar-logo"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="/assets/images/logo.png"
              alt="site logo"
              className="light-logo"
            />
            <img
              src="/assets/images/logo.png"
              alt="site logo"
              className="dark-logo"
            />
            <img
              src="/assets/images/logo.png"
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            {sidebarMenu[role]?.map((item) => (
              <li key={item.path} className="sidebar-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  title={item.name}
                >
                  <Icon icon={item.icon} className="sidebar-icon" />
                  <span className="sidebar-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {/* ThemeToggleButton */}
                <ThemeToggleButton />


                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <img
                      src={currentUser?.profileImage || "assets/images/user.jpg"}
                      alt="image_user"
                      className="w-40-px h-40-px object-fit-cover rounded-circle"
                      style={{ border: "2px solid #FEBA01" }}
                    />
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2 text-capitalize">
                          {currentUser?.name || "User"}
                        </h6>
                        <span className="text-secondary-light fw-medium text-sm text-capitalize">
                          {currentUser?.role || role || "Student"}
                        </span>
                      </div>
                      <button type="button" className="hover-text-danger">
                        <Icon
                          icon="radix-icons:cross-1"
                          className="icon text-xl"
                        />
                      </button>
                    </div>
                    <ul className="to-top-list">
                      <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to={
                            role === "admin"
                              ? "/admin-profile"
                              : role === "teacher"
                                ? "/teacher-profile"
                                : role === "student"
                                  ? "/view-profile"
                                  : ""
                          }
                        >
                          <Icon
                            icon="solar:user-linear"
                            className="icon text-xl"
                          />{" "}
                          My Profile
                        </Link>
                      </li>

                     <li>
  <div
    className="dropdown-item cursor-pointer text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3"
    onClick={(e) => {
      e.stopPropagation(); // 🔹 Stop dropdown close
      if (!logoutLoading) logout(); // 🔹 Only trigger if loader is not running
    }}
  >
    <Icon icon="lucide:power" className="icon text-xl" />
    {logoutLoading ? " Logging out..." : " Logout"}
  </div>
</li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>


        <div className="dashboard-main-body lms-page">
          <Outlet />
        </div>


      </main>
    </section>
  );
};

export default MasterLayout;
