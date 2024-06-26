import { startOfWeek, format, addDays, getDay } from 'date-fns';

const handleDateChange = debounce(function (event) {
    if (event.target.value) {
        const form = document.querySelector("#timesheet");
        const formElements = form.elements;

        const dateParts = event.target.value.split("-");
        const selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        // Check if selected date is already a Sunday
        let weekStart;
        if (getDay(selectedDate) === 0) { // 0 is Sunday
            weekStart = selectedDate;
        } else {
            weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
            showNotification('Defaulted to Sunday: ' + format(weekStart, 'EEE, MM/dd/yy'));
            event.target.value = format(weekStart, 'yyyy-MM-dd');
        }
        // Loop over the IDs from 0 to 6 and update related fields for each entry
        for (let i = 0; i <= 6; i++) {
            const date = addDays(weekStart, i);
            console.debug(i)
            console.debug(date)
            document.getElementById(`timesheet_entries_${i}_label`).textContent = `${format(date, 'EEE, MM/dd/yy')}`;
            // document.getElementById(`timesheet_entries_${i}_hours`).value = 0.0;
            document.getElementById(`timesheet_entries_${i}_day`).value = format(date, 'yyyy-MM-dd');
        }
    }
}, 700);

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
};

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
};

function new_segment_template(entry_index, segment_index) {

    return(`
    <div class="segment border border-zinc-300 rounded-md shadow p-4 my-4">
    <input type="hidden" name="timesheet[entries][${entry_index}][segments_sort][]" value="${segment_index}">
    <div phx-feedback-for="timesheet[entries][${entry_index}][segments][${segment_index}][start]">
        <label
        for="timesheet_entries_${entry_index}_segments_${segment_index}_start" class="block text-sm font-semibold leading-6 text-zinc-800">
        Start:
        </label>
        <input type="time" name="timesheet[entries][${entry_index}][segments][${segment_index}][start]" id="timesheet_entries_${entry_index}_segments_${segment_index}_start"
        class="start_time mt-2 block w-full rounded-lg text-zinc-900 focus:ring-0 sm:text-sm sm:leading-6 phx-no-feedback:border-zinc-300 phx-no-feedback:focus:border-zinc-400 border-zinc-300 focus:border-zinc-400"
        placeholder="00:00 AM|PM">
    </div>
    
    <div>
        <label
        for="timesheet_entries_${entry_index}_segments_${segment_index}_stop" class="block text-sm font-semibold leading-6 text-zinc-800">
        Stop:
        </label>
        <input type="time" name="timesheet[entries][${entry_index}][segments][${segment_index}][stop]" id="timesheet_entries_${entry_index}_segments_${segment_index}_stop"
        class="stop_time mt-2 block w-full rounded-lg text-zinc-900 focus:ring-0 sm:text-sm sm:leading-6 phx-no-feedback:border-zinc-300 phx-no-feedback:focus:border-zinc-400 border-zinc-300 focus:border-zinc-400"
        placeholder="00:00 AM|PM">
    </div>
    <label class="cursor-pointer p-2 bg-blue-600 text-white mt-6 block w-20 text-center rounded-md shadow">
        <input type="checkbox" class="delete_segement_btn hidden" name="timesheet[entries][${entry_index}][segments_drop][]" value="${segment_index}">
        delete
    </label>
    </div>
    `);
};


document.addEventListener("DOMContentLoaded", function () {
    const week_starting = document.getElementById("timesheet_week_starting");
    week_starting.addEventListener('change', handleDateChange);
    document.querySelectorAll('.delete_segement_btn').forEach(button => {

        button.addEventListener('change', function () {
            this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('add_segemnt_btn')[0].classList.remove("hidden") 

            console.log("click");
            if (this.checked) {
                const item = this.closest('.segment');
                item.classList.add('transition-opacity', 'duration-500', 'ease-in-out', 'opacity-0');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 500);
            }
        });
    });

    document.querySelectorAll('.add_segemnt_btn').forEach((button, entry_index) => {
        button.addEventListener('click', function (event) {
            this.classList.add("hidden") 

            event.preventDefault();
            const segment_index = this.parentElement.parentElement.getElementsByClassName("segment").length
            const segments = this.parentElement.parentElement.querySelector(".segments")

            segments.insertAdjacentHTML('beforeend', new_segment_template(entry_index, segment_index));
            
            document.querySelectorAll('.delete_segement_btn').forEach(button => {

                button.addEventListener('change', function () {
                    this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('add_segemnt_btn')[0].classList.remove("hidden") 

                    if (this.checked) {
                        const item = this.closest('.segment');
                        item.classList.add('transition-opacity', 'duration-500', 'ease-in-out', 'opacity-0');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 500);
                    }
                });
            });

            document.querySelectorAll('.segments input[type="time"]').forEach(input => {
                input.addEventListener('change', validateTimes);
            });
            

            function validateTimes(event) {
                const startTime = this.parentElement.parentElement.getElementsByClassName('start_time')[0] && this.parentElement.parentElement.getElementsByClassName('start_time')[0].value;
                const endTime   = this.parentElement.parentElement.getElementsByClassName('stop_time')[0] && this.parentElement.parentElement.getElementsByClassName('stop_time')[0].value;
                
                console.debug(startTime, endTime)
                // Check if both times are selected
                if (startTime === "" || endTime === "") {
                    this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('add_segemnt_btn')[0].classList.add("hidden") 
                }else{
                    this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('add_segemnt_btn')[0].classList.remove("hidden") 
                }

                if (startTime && endTime) {
                    // Convert time strings HH:mm to date objects for comparison
                    const start = new Date('1970-01-01T' + startTime + 'Z');
                    const end = new Date('1970-01-01T' + endTime + 'Z');

                    // Validate that end time does not precede end time
                    if (start >= end) {
                        alert('End time must not precede start time.');
                    }
                }
            }
        });
    });

    // document.querySelectorAll('.segments').forEach((elm, entry_index) => {
    //     console.debug(entry_index, "entry_index")
    //     elm.querySelectorAll('.segment').forEach((elm, segment_index) => {
    //         console.debug(segment_index, "segment_index")
    //     });
    // });
});
