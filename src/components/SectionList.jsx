import React, { useState } from 'react';

const SectionList = ({ title, players, onTogglePayment }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate stats for this specific section
    const sectionTotal = players.reduce((sum, p) => sum + p.price, 0);
    const sectionPaid = players.reduce((sum, p) => sum + (p.isPaid ? p.price : 0), 0);
    const paidCount = players.filter(p => p.isPaid).length;

    return (
        <div className="section-container">
            <div
                className={`section-header ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="section-title">{title}</span>
                <span className="section-summary">
                    {paidCount}/{players.length} ({sectionPaid}€) {isOpen ? '▲' : '▼'}
                </span>
            </div>

            <div className={`section-content ${isOpen ? 'open' : ''}`}>
                <div className="player-list">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className={`player-row ${player.isPaid ? 'paid' : ''}`}
                        >
                            <div className="player-info">
                                <span className="player-name">{player.name}</span>
                                <span className="parent-name">{player.parent}</span>
                            </div>

                            <div className="player-action">
                                <div className="price">
                                    {player.originalPrice && player.originalPrice !== player.price && (
                                        <span className="original-price">{player.originalPrice}€</span>
                                    )}
                                    {player.price}€
                                </div>

                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={player.isPaid || false}
                                    onChange={() => onTogglePayment(player.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SectionList;
