/* ================= GLOBAL VARIABLES ================= */
const modalOverlay = document.getElementById('modalOverlay');
const seePlansBtn = document.getElementById('seePlansBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const planSearch = document.getElementById('planSearch');
const plansContainer = document.getElementById('plans-container');
const alertBox = document.getElementById('status-alert');
let allPlans = [];

/* ================= EVENT LISTENERS ================= */
seePlansBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
    fetchPlans();
});

closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
planSearch.addEventListener('keyup', filterPlans);

/* ================= FUNCTIONS ================= */

// Requirement #8: Handle payment status from URL
function checkPaymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
        alertBox.innerText = "✅ Payment Successful! Enjoy your Premium.";
        alertBox.className = "alert success";
        alertBox.classList.remove('hidden');
    } else if (status === 'cancel') {
        alertBox.innerText = "❌ Payment Canceled. Feel free to try again.";
        alertBox.className = "alert cancel";
        alertBox.classList.remove('hidden');
    }
}

async function fetchPlans() {
    document.getElementById('loading').classList.remove('hidden');
    try {
        const res = await fetch('/plans');
        allPlans = await res.json();
        displayPlans(allPlans);
    } catch (err) {
        document.getElementById('error-container').innerText = "Failed to load plans.";
        document.getElementById('error-container').classList.remove('hidden');
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

function displayPlans(plans) {
    plansContainer.innerHTML = '';
    if (plans.length === 0) {
        plansContainer.innerHTML = '<p>No plans found.</p>';
        return;
    }
    plans.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'plan-card';
        card.innerHTML = `
            <h3>${plan.name}</h3>
            <p>${plan.description}</p>
            <p class="price">₱${(plan.price / 100).toFixed(2)}</p>
            <button onclick="handlePurchase('${plan.id}', this)">Get Started</button>
        `;
        plansContainer.appendChild(card);
    });
}

async function handlePurchase(planId, button) {
    button.disabled = true;
    button.innerText = "Loading...";
    try {
        const res = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId })
        });
        const data = await res.json();
        window.location.href = data.url;
    } catch (err) {
        alert("Checkout error. Try again.");
        button.disabled = false;
        button.innerText = "Get Started";
    }
}

function filterPlans() {
    const term = planSearch.value.toLowerCase();
    const filtered = allPlans.filter(p => p.name.toLowerCase().includes(term));
    displayPlans(filtered);
}

// Initial Check
checkPaymentStatus();