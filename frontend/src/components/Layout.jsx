import Header from './home/Header';
import Footer from './home/Footer';
import ChatButton from './home/ChatButton';

function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <ChatButton />
    </div>
  );
}

export default Layout;
