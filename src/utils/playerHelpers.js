// Helper to calculate stats for a specific section and month
export const getSectionStats = (section, monthId, payments, currentYear) => {
    let paidCount = 0;
    let totalCount = 0;
    let paidAmount = 0;
    let totalAmount = 0;

    const isSummerMonth = monthId === '6' || monthId === '7';
    const skipExpected = isSummerMonth && !section.hasSummerPrep;

    if (section.players) {
        section.players.forEach(player => {
            const price = Number(player.price || 0);
            if (price > 0) {
                if (!skipExpected) {
                    totalCount++;
                    totalAmount += price;
                }
                const key = `${currentYear}_${monthId}_${player.id}`;
                const pmt = payments && payments[key];
                const isPaid = pmt === true || (pmt && pmt.isPaid);
                if (isPaid) {
                    paidCount++;
                    paidAmount += price;
                }
            }
        });
    }
    return { paidCount, totalCount, paidAmount, totalAmount };
};

// Calculate unpaid months for a player up to the current selected month within the current season
export const getPlayerDebtStatus = (player, section, payments, currentMonthId, currentYear) => {
    if (!player || !player.price || Number(player.price) === 0) return null;
    let unpaidCount = 0;
    const currentM = parseInt(currentMonthId);

    if (isNaN(currentM)) return null;

    // Season months sequence starting from September (8) to August (7)
    const seasonMonths = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];
    const currentMonthIndex = seasonMonths.indexOf(currentM);

    // If current month is Jan-Aug (0-7), the season started in previous year
    // If current month is Sep-Dec (8-11), the season started in current year
    const seasonStartYear = currentM >= 8 ? currentYear : currentYear - 1;

    for (let i = 0; i <= currentMonthIndex; i++) {
        const m = seasonMonths[i];
        const yearForMonth = m >= 8 ? seasonStartYear : seasonStartYear + 1;

        // Skip July (6) and August (7) unless the section explicitly has summer prep
        if ((m === 6 || m === 7) && (!section || !section.hasSummerPrep)) {
            continue;
        }

        const key = `${yearForMonth}_${m}_${player.id}`;
        const pmt = payments && payments[key];
        const isPaid = pmt === true || (pmt && pmt.isPaid);
        if (!isPaid) {
            unpaidCount++;
        }
    }

    if (unpaidCount > 0) {
        return {
            status: 'debt',
            text: `${unpaidCount} ${unpaidCount === 1 ? 'μήνας' : 'μήνες'}`,
            color: '#D32F2F', // Red text
            bgColor: '#FFEBEE' // Light red background
        };
    } else {
        return {
            status: 'paid',
            text: 'Εξοφλημένος',
            color: '#2E7D32', // Green text
            bgColor: '#E8F5E9' // Light green background
        };
    }
};
