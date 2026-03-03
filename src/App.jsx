import React, { useState, useEffect, useMemo } from 'react';
import { produtos } from './data';
import './App.css';

// --- COMPONENTE: CARD DO PRODUTO ---
const ProductCard = ({ produto, onAddToCart, onVerImagem }) => {
  const [qtd, setQtd] = useState(1);
  const [added, setAdded] = useState(false);

  const mudarQtd = (delta) => {
    setQtd((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    onAddToCart(produto, qtd);
    setQtd(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badges = produto.tipo.map((t, idx) => {
    const labels = {
      novidade: { class: "badge-novo", text: "Novidade ✨" },
      oferta: { class: "badge-oferta", text: "Oferta 🔥" },
      "porta-copo": { class: "badge-porta-copo", text: "Porta-Copo" },
      brinco: { class: "badge-brinco", text: "Brincos 💎" },
      chaveiro: { class: "badge-chaveiro", text: "Chaveiro 🔑" },
      letra: { class: "badge-letra", text: "Letra 🔠" },
      pingente: { class: "badge-pingente", text: "Pingente 💎" }
    };
    const info = labels[t];
    return info ? <span key={idx} className={`badge ${info.class}`}>{info.text}</span> : null;
  });

  return (
    <div className="card">
      <div className="img-container">
        <img 
          src={`/${produto.img}`} 
          alt={produto.nome} 
          className="card-img" 
          onClick={() => onVerImagem(`/${produto.img}`, produto.nome)} 
          loading="lazy" 
        />
      </div>
      <div className="card-body">
        <div>{badges}</div>
        <h3 className="card-title">{produto.nome}</h3>
        <p className="card-prazo">🕒 {produto.prazo}</p>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="price">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
            <div className="qtd-control">
              <button className="qtd-btn" onClick={() => mudarQtd(-1)}>-</button>
              <span style={{ minWidth: '16px', textAlign: 'center', fontWeight: '600' }}>{qtd}</span>
              <button className="qtd-btn" onClick={() => mudarQtd(1)}>+</button>
            </div>
          </div>
          <button className={`add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? (
              <>Adicionado <span className="material-icons-round" style={{ fontSize: '18px' }}>check</span></>
            ) : (
              <>Adicionar <span className="material-icons-round" style={{ fontSize: '18px' }}>shopping_cart</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: APP ---
export default function App() {
  const [carrinho, setCarrinho] = useState(() => {
    const salvo = localStorage.getItem('carrinhoMB');
    return salvo ? JSON.parse(salvo) : [];
  });
  
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtual, setFiltroAtual] = useState('todos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  
  const [lightbox, setLightbox] = useState({ open: false, url: '', nome: '' });
  const [toast, setToast] = useState({ show: false, text: '' });

  // Salvar carrinho no LocalStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('carrinhoMB', JSON.stringify(carrinho));
  }, [carrinho]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchFiltro = filtroAtual === 'todos' || p.tipo.includes(filtroAtual);
      const matchBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase());
      return matchFiltro && matchBusca;
    });
  }, [termoBusca, filtroAtual]);

  const addToCart = (produto, qtd) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id);
      if (existente) {
        return prev.map(item => 
          item.id === produto.id ? { ...item, quantidade: item.quantidade + qtd } : item
        );
      }
      return [...prev, { ...produto, quantidade: qtd }];
    });

    // Animações
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
    
    setToast({ show: true, text: `+ ${qtd}x ${produto.nome} no carrinho!` });
    setTimeout(() => setToast({ show: false, text: '' }), 2500);
  };

  const removeFromCart = (index) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
  };

  const checkoutWhatsApp = () => {
    if (carrinho.length === 0) return alert("Adicione produtos ao carrinho primeiro!");

    const numeroWhatsApp = "5581997192611";
    let mensagem = "*Olá! Gostaria de fazer um pedido de peças em Resina:*\n\n";
    let total = 0;

    carrinho.forEach(item => {
      const subtotal = item.preco * item.quantidade;
      mensagem += `▪️ ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      total += subtotal;
    });

    mensagem += `\n*💰 Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    mensagem += "\n\nPodemos combinar o pagamento e a entrega?";

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`, '_blank');

    setCarrinho([]);
    setCartOpen(false)
  };

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const categorias = [
    { id: 'todos', label: 'Todos' },
    { id: 'novidade', label: 'Novidades ✨' },
    { id: 'oferta', label: 'Ofertas 🔥' },
    { id: 'brinco', label: 'Brincos 💎' },
    { id: 'porta-copo', label: 'Porta-Copos ☕' },
    { id: 'letra', label: 'Letras 🔠' },
    { id: 'pingente', label: 'Pingentes 💎' },
    { id: 'chaveiro', label: 'Chaveiros 🔑' }
  ];

  return (
    <>
      <header>
        <div className="logo">Ateliê MB Criative</div>
        <div className={`cart-icon ${cartBounce ? 'bounce' : ''}`} onClick={() => setCartOpen(true)}>
          <span className="material-icons-round">shopping_bag</span>
          <span className="cart-count">{totalItens}</span>
        </div>
      </header>

      <div className="search-section">
        <div className="search-bar">
          <span className="material-icons-round">search</span>
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
        <button className="menu-mobile-btn" onClick={() => setMenuOpen(true)}>
          <span className="material-icons-round">filter_list</span> Categorias
        </button>
      </div>

      <div className={`filters-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}></div>
      <div className={`filters ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3>Categorias</h3>
          <button className="close-menu" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        {categorias.map(cat => (
          <button 
            key={cat.id}
            className={`filter-btn ${filtroAtual === cat.id ? 'active' : ''}`} 
            onClick={() => { setFiltroAtual(cat.id); setMenuOpen(false); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="container">
        {produtosFiltrados.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '40px' }}>
            Nenhum produto encontrado.
          </p>
        ) : (
          produtosFiltrados.map(p => (
            <ProductCard 
              key={p.id} 
              produto={p} 
              onAddToCart={addToCart} 
              onVerImagem={(url, nome) => setLightbox({ open: true, url, nome })} 
            />
          ))
        )}
      </div>

      {/* MODAL DO CARRINHO */}
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}></div>
      <div className={`cart-modal ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="close-cart" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {carrinho.length === 0 ? (
            <div className="empty-cart">
              <span className="material-icons-round">remove_shopping_cart</span>
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            carrinho.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div style={{ flexGrow: 1, marginRight: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{item.nome}</div>
                  <div style={{ color: 'var(--texto-secundario)', fontSize: '0.85rem' }}>
                    {item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')} 
                    <strong style={{ color: 'var(--texto)', marginLeft: '8px' }}>
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                </div>
                <button onClick={() => removeFromCart(idx)} style={{ color: '#ef4444', border: 'none', background: '#fee2e2', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>delete_outline</span>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="total-row">
            <span>Total:</span>
            <span>R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <button className="checkout-btn" onClick={checkoutWhatsApp}>
            Finalizar no WhatsApp <span className="material-icons-round" style={{ fontSize: '18px', marginLeft: '8px' }}>whatsapp</span>
          </button>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox.open && (
        <div className="lightbox" style={{ display: 'flex' }} onClick={() => setLightbox({ open: false, url: '', nome: '' })}>
          <img className="lightbox-content" src={lightbox.url} alt={lightbox.nome} />
          <div className="lightbox-caption">{lightbox.nome}</div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      <div id="msg-toast" style={{
        position: 'fixed', bottom: toast.show ? '40px' : '30px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#2D3748', color: 'white', padding: '12px 24px', borderRadius: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 3000, fontWeight: 500, fontSize: '0.9rem',
        opacity: toast.show ? 1 : 0, transition: 'opacity 0.3s, bottom 0.3s', pointerEvents: 'none'
      }}>
        {toast.text}
      </div>
    </>
  );
}