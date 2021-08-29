    var todo = {};
    var editor; // use a global for the submit and return data rendering in the datatables
    var cost = 0;
    cost = cost.toFixed(2);
    var pastTime;
    $(document).ready(function () {
        var myVar = setInterval(myTimer, 1000);
        var myVar = setInterval(costCalculator, 60000);






        function myTimer() {
            var date = new Date();
            var pastTime = date.toLocaleTimeString();
            return pastTime;
        }

        // Object that will contain the local state


        // Create or update the todo localStorage entry
        if (localStorage.getItem('todo')) {
            todo = JSON.parse(localStorage.getItem('todo'));
        }
        function costCalculator() {
            var table = $('#datatable').DataTable();



            var len = table
                .column(0)
                .data()
                .length;
            for (var i = 0; i < len; i++) {
                var output = { data: [] };
                var data = table.rows().columns(3).data()[0][i];
                pastTime = new Date("01/01/2000 " + data);
                var current = new Date();
                current = current.toLocaleTimeString();
                var cTime = new Date("01/01/2000 " + current);
                var diffMs = (cTime - pastTime);
                var diffMins = Math.floor(diffMs / 1000 / 60);
                var minutesDiv = diffMins / 30;
                var minutesFloor = Math.floor(minutesDiv);
                cost = minutesFloor * 0.5;
                cost = cost.toFixed(2);
                table.cell({ row: i, column: 2 }).data("₺" + cost);

                localStorage.setItem('todo', JSON.stringify(todo));


            }

            var options = { hour12: false };
        }
        // Set up the editor
        editor = new $.fn.dataTable.Editor({
            table: "#datatable",
            fields: [
                {

                    label: "Araç Plakası:",
                    name: "car_id"
                }, {
                    label: "Markası:",
                    name: "car_brand"
                }, {
                    type: "readonly",
                    label: "Ücret:",
                    name: "cost",
                    def: "₺" + cost
                }, {

                    label: "Giriş Zamanı: (hh:mm:ss)",
                    name: "entry_time",


                }
            ],
            ajax: function (method, url, d, successCallback, errorCallback) {
                var output = { data: [] };

                if (d.action === 'create') {
                    // Create new row(s), using the current time and loop index as
                    // the row id
                    var dateKey = +new Date();

                    $.each(d.data, function (key, value) {
                        var id = dateKey + '' + key;

                        value.DT_RowId = id;
                        todo[id] = value;
                        output.data.push(value);
                    });
                }
                else if (d.action === 'edit') {
                    // Update each edited item with the data submitted
                    $.each(d.data, function (id, value) {
                        value.DT_RowId = id;
                        $.extend(todo[id], value);
                        output.data.push(todo[id]);
                    });
                }
                else if (d.action === 'remove') {
                    // Remove items from the object
                    $.each(d.data, function (id) {
                        delete todo[id];
                    });
                }



                // Store the latest `todo` object for next reload
                localStorage.setItem('todo', JSON.stringify(todo));

                // Show Editor what has changed
                successCallback(output);
            }
        });

        $('#datatable').on('click', 'a.car_delete', function (e) {
            e.preventDefault();
            var table = $('#datatable').DataTable();
            var index_in_table = $('a.car_delete').index($(this));
            var cost_of_row = table.rows().columns(2).data()[0][index_in_table];
            if (cost_of_row == "₺0.00") {
                editor
                    .title('Sil')
                    .message("Bu kayıt silinsin mi?")
                    .buttons({ "label": "Sil", "fn": function () { editor.submit() } })
                    .remove($(this).closest('tr'));

                localStorage.setItem('todo', JSON.stringify(todo));
            } else {
                alert("Ücret: " + cost_of_row + ", müşteri silinemez. Yalnızca çıkış yapılabilir.");
            }

        });
        $('#datatable').on('click', 'a.car_exit', function (e) {
            e.preventDefault();
            var table = $('#datatable').DataTable();
            var index_in_table = $('a.car_exit').index($(this));
            var cost_of_row = table.rows().columns(2).data()[0][index_in_table];
            $(this).closest('tr').css('background-color', '#a19898')
            alert("Ücret: " + cost_of_row + " İyi Günler!");
            localStorage.setItem('todo', JSON.stringify(todo));

        });

        // Initialise the DataTable
        $('#datatable').DataTable({
            "order": [[3, 'asc']],
            dom: "Bfrtip",
            data: $.map(todo, function (value, key) {
                return value;
            }),
            columns: [
                { data: 'car_id' },
                { data: 'car_brand' },
                { data: 'cost' },
                { data: 'entry_time' },
                {
                    data: null,
                    className: "center",
                    defaultContent: '<a href="" class="car_exit">Çıkış</a> / <a href="" class="car_delete">Sil</a>'
                }



            ],
            columnDefs: [
                { "className": "dt-center", "targets": "_all" }
            ],
            select: true,
            buttons: [
                { extend: "create", editor: editor },
                { extend: "edit", editor: editor }


            ]
        });
    });

