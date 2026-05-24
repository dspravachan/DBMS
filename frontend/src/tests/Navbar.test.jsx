import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../layouts/Navbar';

test('renders Navbar and checks elements', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  const loginLink = screen.getByText(/Log in/i);
  expect(loginLink).toBeInTheDocument();
  
  const shopAllLink = screen.getByText(/Shop All/i);
  expect(shopAllLink).toBeInTheDocument();
});
