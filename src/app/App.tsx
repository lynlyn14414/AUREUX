import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Write } from './pages/Write';
import { Social } from './pages/Social';
import { Library } from './pages/Library';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { StoryDetails } from './pages/StoryDetails';
import { CommunityStories } from './pages/CommunityStories';
import { MyStories } from './pages/MyStories';
import { Chat } from './pages/Chat';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { AppProvider } from './context/AppContext';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 relative">
          <Toaster position="top-center" theme="dark" />
          <Navbar />
          <main className="relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/social" element={<Social />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/story/:id" element={<StoryDetails />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/community-stories" element={<CommunityStories />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/write" element={<Write />} />
                <Route path="/library" element={<Library />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-stories" element={<MyStories />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
