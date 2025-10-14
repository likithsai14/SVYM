document.addEventListener('DOMContentLoaded', () => {
    const totalFeesElement = document.getElementById('totalFees');
    const pendingFeesElement = document.getElementById('pendingFees');
    const completedFeesElement = document.getElementById('completedFees');
    const paymentHistoryTableBody = document.getElementById('paymentHistoryTableBody');
    const downloadReceiptsBtn = document.getElementById('downloadReceiptsBtn');

    let feeRecords = []; // This will store all transactions for the logged-in student

    // Fetch student-specific fee data from Netlify function
    async function fetchStudentFeeData() {
    try {
        const studentId = sessionStorage.getItem('userId'); // or however you store it
        const res = await fetch("/.netlify/functions/getStudentFees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId })
        });

        if (!res.ok) throw new Error('Failed to fetch fee data');

        const data = await res.json(); // Array of student's transactions
        feeRecords = data;
        console.log(feeRecords);
        calculateFeeSummary();
        displayPaymentHistory();
    } catch (error) {
        console.error('Error fetching student fee data:', error);
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:red; padding:20px;">
                    Failed to load payment data.
                </td>
            </tr>
        `;
    }
}


    // Calculate total, paid, and pending amounts
    function calculateFeeSummary() {
        let totalCourseFees = 0;
        let totalPaid = 0;

        feeRecords.forEach(record => {
            totalCourseFees += record.totalAmount || 0; // total price of course
            totalPaid += record.amountPaid || 0; // payment amount
        });

        const totalPending = totalCourseFees - totalPaid;

        totalFeesElement.textContent = `INR ${totalCourseFees.toFixed(2)}`;
        pendingFeesElement.textContent = `INR ${totalPending.toFixed(2)}`;
        completedFeesElement.textContent = `INR ${totalPaid.toFixed(2)}`;
    }

    // Display payment history table
    function displayPaymentHistory() {
    paymentHistoryTableBody.innerHTML = '';

    if (!feeRecords.length) {
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                    No payment history available.
                </td>
            </tr>
        `;
        return;
    }

    let hasRecords = false;

    feeRecords.forEach(course => {
        if (course.payments && course.payments.length) {
            hasRecords = true;
            course.payments.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${course.courseName || "Course Name"}</td>
                    <td>${record.transactionId}</td>
                    <td>INR ${record.amount.toFixed(2)}</td>
                    <td>${record.method}</td>
                    <td>Completed</td>
                    <td>
                        <button class="download-receipt-btn"
                            data-transaction-id="${record.transactionId}"
                            data-course-name="${course.courseName || "Course Name"}"
                            data-amount="${record.amount.toFixed(2)}"
                            data-date="${new Date(record.date).toLocaleDateString()}"
                            data-method="${record.method}">
                            <i class="fas fa-file-download"></i>
                        </button>
                    </td>
                `;
                paymentHistoryTableBody.appendChild(row);
            });
        }
    });

    if (!hasRecords) {
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                    No payment history available.
                </td>
            </tr>
        `;
    }

    // Attach download button event listeners
    document.querySelectorAll('.download-receipt-btn').forEach(button => {
        button.addEventListener('click', event => {
            const data = event.currentTarget.dataset;
            generateSingleReceiptPdf(data);
        });
    });
}


    // Generate single receipt PDF
    function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const studentName = "Student Name"; // Optionally fetch real student name

        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255);
        doc.text("Tech4Hope", 105, 20, null, null, "center");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Payment Receipt", 105, 30, null, null, "center");

        doc.setLineWidth(0.5);
        doc.setDrawColor(30, 144, 255);
        doc.line(20, 35, 190, 35);

        let y = 50;
        doc.setFontSize(12);
        doc.text(`Student Name: ${studentName}`, 20, y);
        y += 10;
        doc.text(`Transaction ID: ${data.transactionId}`, 20, y);
        y += 10;
        doc.text(`Date: ${data.date}`, 20, y);
        y += 10;
        doc.text(`Course: ${data.courseName}`, 20, y);
        y += 10;
        doc.text(`Payment Method: ${data.method}`, 20, y);
        y += 20;

        doc.setFontSize(18);
        doc.setTextColor(40, 167, 69);
        doc.text(`Amount Paid: INR ${data.amount}`, 20, y);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for your payment!", 105, doc.internal.pageSize.height - 20, null, null, "center");
        doc.text("Tech4Hope, Empowering Lives Through Skills", 105, doc.internal.pageSize.height - 15, null, null, "center");

        doc.save(`Tech4Hope_Receipt_${data.transactionId}.pdf`);
    }

    // --- Pay Dues modal and handlers ---
    function createPayModal() {
        if (document.getElementById('payModal')) return;

                const style = document.createElement('style');
                style.textContent = `
                /* Adapted from css/modal.css to style the pay modal */
                .pay-modal-backdrop {
                    display: none; /* hidden until opened */
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0, 0, 0, 0.4);
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }

                /* when script sets display:flex the backdrop will become visible */
                .pay-modal-backdrop.show { display: flex; }

                .pay-modal {
                    background-color: white;
                    margin: auto;
                    padding: 30px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    position: relative;
                    animation-name: animatetop;
                    animation-duration: 0.4s;
                }

                .pay-modal h3 {
                    margin-top: 0;
                    font-size: 1.6rem;
                    color: #007bff;
                    border-bottom: 2px solid rgba(233,236,239,0.8);
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }

                .pay-modal .row { margin-bottom: 12px; }

                .pay-modal label { font-family: 'Poppins', sans-serif; display: block; margin-bottom: 6px; font-size: 16px; color: #333; }

                .pay-modal select,
                .pay-modal input { font-family: 'Poppins', sans-serif;font-size: 14px; width: 100%; padding: 10px; border: 1px solid #e9ecef; border-radius: 8px; box-sizing: border-box; }

                .pay-modal .actions { display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }

                .pay-modal .btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; }
                .pay-modal .btn.primary { background: var(--primary-color, #007bff); color: #fff; }
                .pay-modal .btn.secondary { background: #f1f1f1; color: #333; }

                /* Animations (copied from modal.css) */
                @keyframes animatetop {
                    from { top: -300px; opacity: 0; }
                    to { top: 0; opacity: 1; }
                }
                `;
                document.head.appendChild(style);

        const backdrop = document.createElement('div');
        backdrop.id = 'payModal';
        backdrop.className = 'pay-modal-backdrop';

        backdrop.innerHTML = `
            <div class="pay-modal" role="dialog" aria-modal="true" aria-labelledby="payModalTitle">
                <span class="close-btn" id="payModalCloseBtn" aria-label="Close">&times;</span>
                <h3 id="payModalTitle">Pay Dues</h3>
                    <div class="row">
                        <label for="payCourseSelect">Select Course</label>
                        <select id="payCourseSelect"><option value="">Loading...</option></select>
                    </div>
                    <div class="row">
                        <label for="payAmountInput">Amount (INR)</label>
                        <input id="payAmountInput" type="number" step="0.01" min="0" />
                    </div>
                    <div class="row">
                        <label for="payMethodSelect">Payment Method</label>
                        <select id="payMethodSelect">
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Net Banking">Net Banking</option>
                        </select>
                    </div>
                <div class="actions">
                    <button class="btn secondary" id="cancelPayBtn">Cancel</button>
                    <button class="btn primary" id="submitPayBtn">Submit Payment</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

    document.getElementById('cancelPayBtn').addEventListener('click', closePayModal);
        document.getElementById('payCourseSelect').addEventListener('change', onCourseSelectChange);
        document.getElementById('submitPayBtn').addEventListener('click', onSubmitPayment);
    // close button (top-right) wired to same close handler
    const closeBtn = document.getElementById('payModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closePayModal);
    }

    function openPayModal() {
        createPayModal();
        populateCourseDropdown();
        const modal = document.getElementById('payModal');
        if (modal) modal.style.display = 'flex';
    }

    function closePayModal() {
        const modal = document.getElementById('payModal');
        if (modal) modal.remove();
    }

    function populateCourseDropdown() {
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        select.innerHTML = '';

        if (!feeRecords || !feeRecords.length) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No enrolled courses found';
            select.appendChild(opt);
            amountInput.value = '';
            return;
        }

        feeRecords.forEach((f, idx) => {
            const opt = document.createElement('option');
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            // Use courseId (provided by getStudentFees) as the option value. Fallback to id if not present.
            opt.value = f.courseId || f.id || '';
            opt.textContent = `${f.courseName || 'Course'} (Due: INR ${Number(due).toFixed(2)})`;
            // store index for quick lookup if needed
            opt.dataset.idx = String(idx);
            select.appendChild(opt);
        });

        select.selectedIndex = 0;
        onCourseSelectChange();
    }

    function onCourseSelectChange() {
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        const courseId = select.value;
        if (!courseId) {
            amountInput.value = '';
            return;
        }

        // find record by courseId or id
        const f = feeRecords.find(r => (r.courseId === courseId) || (r.id === courseId));
        if (f) {
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            amountInput.value = Number(due).toFixed(2);
        } else {
            // fallback to option dataset
            const opt = select.selectedOptions[0];
            const due = opt && opt.dataset && opt.dataset.due ? Number(opt.dataset.due) : '';
            amountInput.value = due !== '' ? Number(due).toFixed(2) : '';
        }
    }

    async function onSubmitPayment(ev) {
        ev.preventDefault();
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        const methodSelect = document.getElementById('payMethodSelect');

        const courseId = select.value;
        if (!courseId) {
            alert('Please select a valid course to pay for.');
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        const studentId = sessionStorage.getItem('userId');

        const payload = {
            studentId: studentId,
            courseId: courseId,
            amount: amount,
            paymentMethod: methodSelect.value || 'UPI'
        };
        console.log('Submitting payment payload:', payload);
        try {
            const res = await fetch('/.netlify/functions/payDues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const body = await res.json();

            if (!res.ok) {
                console.error('Payment failed', body);
                alert(body.message || 'Payment failed.');
                return;
            }

            alert(body.message || 'Payment successful');
            closePayModal();
            fetchStudentFeeData();
        } catch (err) {
            console.error('Error submitting payment:', err);
            alert('An error occurred while processing the payment.');
        }
    }

    // Wire Pay Dues button
    if (downloadReceiptsBtn) {
        downloadReceiptsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openPayModal();
        });
    }

    // Fetch data on page load
    fetchStudentFeeData();
});
