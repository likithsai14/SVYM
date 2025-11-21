document.addEventListener('DOMContentLoaded', () => {
    const totalFeesElement = document.getElementById('totalFees');
    const pendingFeesElement = document.getElementById('pendingFees');
    const completedFeesElement = document.getElementById('completedFees');
    const paymentHistoryTableBody = document.getElementById('paymentHistoryTableBody');
    const downloadReceiptsBtn = document.getElementById('downloadReceiptsBtn');

    let feeRecords = []; // This will store all transactions for the logged-in student
    
    // --- Added studentName variable ---
    let studentName = "Student Name"; // Default fallback

    // Fetch student-specific fee data from Netlify function
    async function fetchStudentFeeData() {
        try {
            const studentId = sessionStorage.getItem('userId'); // or however you store it

            // Fetch student profile to get the name
            const profileRes = await fetch("/.netlify/functions/getStudentProfile?userId=" + studentId, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                studentName = profileData.user.candidateName || "Student Name";
            } else {
                studentName = sessionStorage.getItem('userName') || "Student Name";
            }

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
        let totalStudentFees = 0;
        let totalFunded = 0;
        let totalPaid = 0;

        feeRecords.forEach(record => {
            totalCourseFees += record.coursePrice || 0; // course price
            totalStudentFees += record.totalAmount || 0; // student amount
            totalFunded += record.fundedAmount || 0;
            totalPaid += record.amountPaid || 0; // payment amount
        });

        const totalPending = totalStudentFees - totalPaid;

        totalFeesElement.textContent = `INR ${totalCourseFees.toFixed(2)}`;
        document.getElementById('fundedFees').textContent = `INR ${totalFunded.toFixed(2)}`;
        document.getElementById('studentFees').textContent = `INR ${totalStudentFees.toFixed(2)}`;
        pendingFeesElement.textContent = `INR ${totalPending.toFixed(2)}`;
        completedFeesElement.textContent = `INR ${totalPaid.toFixed(2)}`;

        // Update pending card if all cleared
        const pendingCard = document.getElementById('pendingCard');
        const pendingTitle = document.getElementById('pendingTitle');
        const pendingDesc = document.getElementById('pendingDesc');
        if (totalPending === 0) {
            pendingCard.classList.remove('pending');
            pendingCard.classList.add('cleared');
            pendingTitle.textContent = 'All Cleared!';
            pendingDesc.textContent = 'All fees have been paid.';
            pendingFeesElement.style.color = '#28a745'; // green
        } else {
            pendingCard.classList.add('pending');
            pendingCard.classList.remove('cleared');
            pendingTitle.textContent = 'Pending Fees';
            pendingDesc.textContent = 'Amount still due for your courses.';
            pendingFeesElement.style.color = '#dc3545'; // red
        }
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
                    
                    // --- Added 'data-student-name' to the button ---
                    row.innerHTML = `
                        <td>${formatDate(record.date)}</td>
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
                                data-date="${formatDate(record.date)}"
                                data-method="${record.method}"
                                data-student-name="${studentName}">
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

    // --- ADDED HELPER FUNCTION to convert numbers to words (Indian system) ---
    function numberToWordsINR(num) {
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const inWords = (n) => {
            let str = '';
            if (n > 99) {
                str += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n > 19) {
                str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
            } else {
                str += a[n];
            }
            return str;
        };

        let numStr = num.toString();
        let [integerPart, decimalPart] = numStr.split('.');
        
        let words = '';
        let numInt = parseInt(integerPart);

        if (numInt === 0) {
            words = 'Zero';
        } else {
            let crores = Math.floor(numInt / 10000000);
            numInt %= 10000000;
            let lakhs = Math.floor(numInt / 100000);
            numInt %= 100000;
            let thousands = Math.floor(numInt / 1000);
            numInt %= 1000;
            let hundreds = Math.floor(numInt / 100);
            numInt %= 100;
            
            if (crores > 0) words += inWords(crores) + ' Crore ';
            if (lakhs > 0) words += inWords(lakhs) + ' Lakh ';
            if (thousands > 0) words += inWords(thousands) + ' Thousand ';
            if (hundreds > 0) words += inWords(hundreds) + ' Hundred ';
            if (numInt > 0) words += inWords(numInt);
        }

        words = words.replace(/ +/g, ' ').trim(); // Clean up extra spaces

        if (decimalPart && parseInt(decimalPart) > 0) {
            words += ' and ' + inWords(parseInt(decimalPart.slice(0, 2))) + ' Paisa';
        }
        
        // Capitalize first letter
        return words.charAt(0).toUpperCase() + words.slice(1);
    }


    // Helper function to load image as base64
    async function getImageBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    // --- REPLACED 'generateSingleReceiptPdf' function ---
    async function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get data from the button's dataset
        const studentName = data.studentName || "Student Name";
        const courseName = data.courseName || "N/A";
        const transactionId = data.transactionId || "N/A";
        const amount = parseFloat(data.amount).toFixed(2);
        const date = data.date || "N/A";
        const method = data.method || "N/A";
        const amountInWords = numberToWordsINR(amount) + " Only";

        // --- Document Coordinates ---
        const leftMargin = 20;
        const rightMargin = 190;
        const center = 105;
        let y = 10; // Current Y position

        // Load logo
        let logoBase64 = '';
        try {
            logoBase64 = await getImageBase64('public/Logos BW.png');
        } catch (e) {
            console.error('Failed to load logo', e);
        }

        // --- 1. Header ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Reg No. 122/84-5", rightMargin, y, { align: 'right' });
        y += 10;

        // Add logo if loaded
        if (logoBase64) {
            const logoWidth = 80;
            const logoHeight = 35;
            const logoX = center - (logoWidth / 2);
            doc.addImage(logoBase64, 'PNG', logoX, y, logoWidth, logoHeight);
            y += 55;
        } else {
            y += 5; // small adjustment if no logo
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SWAMI VIVEKANANDA YOUTH MOVEMENT", center, y, { align: 'center' });
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("CA2, KIADB Industrial Area, Hebbal, Mysore, Karnataka - 570016", center, y, { align: 'center' });
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("FEE RECEIPT", center, y, { align: 'center' });
        y += 5;

        doc.setLineWidth(0.5);
        doc.line(leftMargin + 20, y, rightMargin - 20, y); // Underline title
        y += 15;

        // --- 2. Receipt Details Table ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        // Create table data
        const tableData = [
            ["Transaction No:", transactionId.length > 20 ? transactionId.substring(0, 20) + '...' : transactionId],
            ["Date:", date],
            ["Payment Mode:", method],
            ["Received From:", studentName],
            ["Course:", courseName],
            ["Amount:", `INR ${amount}`],
            ["Amount in Words:", amountInWords]
        ];

        // AutoTable for better organization
        doc.autoTable({
            startY: y,
            head: [],
            body: tableData,
            theme: 'plain',
            styles: {
                fontSize: 11,
                cellPadding: 8,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 50 },
                1: { cellWidth: 130 }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: leftMargin, right: rightMargin }
        });

        y = doc.lastAutoTable.finalY + 20;

        // --- 3. Footer ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Authorized Signature", rightMargin, y, { align: 'right' });

        // --- 4. Save ---
        doc.save(`SVYM_Fee_Receipt_${transactionId}.pdf`);
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
                color: #2e4f8f;
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
            .pay-modal .btn.primary { background: var(--primary-color, #2e4f8f); color: #fff; }
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
                <span class="close-btn" id="payModalCloseBtn" aria-label="Close" style="position: absolute; top: 10px; right: 20px; font-size: 28px; cursor: pointer; color: #888;">&times;</span>
                <h3 id="payModalTitle">Pay Due</h3>
                    <div class="row">
                        <label for="payCourseSelect">Select Course</label>
                        <select id="payCourseSelect"><option value="">Loading...</option></select>
                    </div>
                    <div class="row">
                        <label for="payAmountInput">Amount (INR)</label>
                        <input id="payAmountInput" type="number" step="0.01" min="0" />
                    </div>
                    <div class="row">
                        <label for="payMethodSelect">Payment Mode</label>
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
        if (modal) modal.classList.add('show'); // Use class to trigger display
    }

    function closePayModal() {
        const modal = document.getElementById('payModal');
        if (modal) modal.remove();
    }

    function populateCourseDropdown() {
        const select = document.getElementById('payCourseSelect');
        const amountInput = document.getElementById('payAmountInput');
        select.innerHTML = ''; // Clear loading/stale options

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

        select.selectedIndex = 0; // Select the first item
        onCourseSelectChange(); // Trigger change to populate amount
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
        
        // Disable button to prevent double submit
        ev.target.disabled = true;
        ev.target.textContent = 'Processing...';

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
            fetchStudentFeeData(); // Refresh the data
        } catch (err) {
            console.error('Error submitting payment:', err);
            alert('An error occurred while processing the payment.');
        } finally {
            // Re-enable button
            // (Note: modal is closed, so button doesn't exist, but good practice)
            // if (ev.target) {
            //     ev.target.disabled = false;
            //     ev.target.textContent = 'Submit Payment';
            // }
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