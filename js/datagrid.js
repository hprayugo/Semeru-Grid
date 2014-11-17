(function ( $ ) {

	$.fn.datagrid = function(options) {

		var settings = $.extend({
	        url: '',
	        primaryField: '',
	        rowNumber : false, 
	        rowCheck : false,
	        paging: '',
	        info: '',
	        option: '',
	        search: '',
	        searchOption: '',
	        currentPage: 1,
	        currentPageSize: 10,
	        pageSize: [10,20,50,100],
	        columns: []
	    }, options );

		var arrData			= [];
		var sort 			= '';
		var arrChecked 		= [];
		var order 			= 'DESC';
		var table 			= $(this);
		var infoWrapper 	= $(settings.info);
		var pagingWrapper 	= $(settings.paging);

		function buildTable() 
		{	
			/*
			 * MEMBUAT THEAD DAN TBODY 
			 */
			
			$(table).append('<thead><tr></tr></thead><tbody></tbody>');

			/*
			 * MENAMPILKAN KOLOM 
			 */
			
			settings.rowNumber == true || settings.rowNumber == 'true' ? $(table).children('thead').children().append("<th style='text-align: center; width: 20px;'>No</th>") : '';
			settings.rowCheck == true || settings.rowCheck == 'true' ? $(table).children('thead').children().append("<th style='text-align: center; width: 20px;'><input type='checkbox'></th>") : '';

			settings.columns.forEach(function(row) 
			{
				$(table).children('thead').children().append("<th title='"+row.field+"' style='text-align: "+row.align+"; width: "+row.width+"px;'>"+row.title+"</th>");
			});
		}

		function appendData(currentPage, currentPageSize, searchData) 
		{
			/*
			 * POST DATA
			 */

			var currentPage = parseInt(currentPage);
			var limit = (currentPage * currentPageSize) - currentPageSize;

			$.ajax({
				url: settings.url,
				async: false,
				type: 'post',
				dataType: 'json',
				data: 
				{
					limit: limit, 
					offset: currentPageSize, 
					sort: sort, 
					order: order, 
					searchData : searchData
				},
				success: function(jsonData) 
				{
					arrData = $.map(jsonData, function(el) 
					{ 
						return el; 
					});

					/*
					 * TAMPILKAN DATA
					 */
					
					$(table).children('tbody').each(function() 
					{
						var tbody = $(this);
						var no = limit + 1;
						var appendData = '';

						/*
						 * SIAPKAN DATA SESUAI KOLOM
						 */

						for(var i = 1; i < arrData.length; i++) 
						{
							appendData += '<tr>';
							appendData += settings.rowNumber == true || settings.rowNumber == 'true' ? "<td id='no'>"+no+"</td>" : '';
							appendData += settings.rowCheck == true || settings.rowCheck == 'true' ? "<td style='text-align: center; width: 20px;'><input value='"+arrData[i][settings.primaryField]+"' type='checkbox'></td>" : '';

							settings.columns.forEach(function(rowColumn, index) 
							{
								/*
								 * JIKA KOLOM TIDAK BERNILAI UNDEFINED MAKA TAMPILKAN KOLOM
								 */

								if(arrData[i][rowColumn.field] != undefined)
								{
									appendData += "<td style='text-align: "+rowColumn.align+"; width: "+rowColumn.width+"px;'>"+arrData[i][rowColumn.field]+"</td>";
								}
								else
								{
									appendData += "<td style='text-align: "+rowColumn.align+"; width: "+rowColumn.width+"px;'>"+rowColumn.rowStyler(arrData[i], i)+"</td>";
								}
							});

							appendData += '</tr>';
							no++;
						}

						/*
						 * APPEND DATA KE TBODY
						 */

						$(tbody).children().remove();
						$(tbody).append(appendData);

					});

					/*
					 * CHECK UNCHECK ROW
					 */

					$(table).children('thead').children().each(function() 
					{
						$(this).children().each(function(index, object) 
						{
							if(index == getUsedRow()) 
							{
								$(this).children().on('click', function() 
								{
									if($(this).prop('checked'))
									{
										$.ajax({
											url: settings.url,
											async: false,
											type: 'post',
											dataType: 'json', 
											data: 
											{
												limit: 0, 
												offset: arrData[0], 
												sort: sort, 
												order: order, 
												searchData : searchData
											},
											success: function(data) 
											{
												arrChecked = [];

												arrCheckData = $.map(data, function(el) 
												{ 
													return el;
												});

												for(var i = 0; i < arrCheckData.length; i++)
												{
													arrChecked[arrChecked.length] = arrCheckData[i][settings.primaryField];
												}

												appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
											}
										});
									}
									else
									{
										arrChecked = [];

										appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
									}
								});
							}
						});
					});

					$(table).children('tbody').children().each(function() 
					{
						$(this).children().each(function(index, object) 
						{
							if(index == getUsedRow()) 
							{
								$(this).children().each(function() 
								{
									/*
									 * CHECK CHECKBOX SESUAI ARRAY
									 */

									for(var i = 0; i < arrChecked.length; i++) 
									{
										if(arrChecked[i] == this.value) 
										{
											$(this).prop("checked", true);
										}
									}

									$(this).on('click', function() 
									{
										var temp, found = false;

										for(var i = 0; i < arrChecked.length; i++) 
										{
											if(arrChecked[i] == this.value) 
											{
												found = true;
												temp = i;
											}
										}

										if(!found) 
										{
											arrChecked[arrChecked.length] = this.value;
										}
										else
										{
											arrChecked.splice(temp, 1);
										}

										appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
									});
								});
							}
						});
					});

					/*
					 * OPTION PAGESIZE
					 */

					var optionContent = "";

					for(var i = 0; i < settings.pageSize.length; i++) 
					{
						optionContent += "<option value='" + settings.pageSize[i] + "'>" + settings.pageSize[i] + "</option>";
					}

					$(option).html(optionContent);
					$(option).val(settings.currentPageSize);

					$(option).on('change', function() 
					{
						var selectedOption = $(option).children('option:selected').val();

						if(selectedOption != '') 
						{
							settings.currentPageSize = selectedOption;
							appendData(1, settings.currentPageSize, getCurrentDataSearch());
						}
					});

					/*
					 * INFO HALAMAN YANG AKTIF
					 */

					var startLimit = ((currentPage*currentPageSize)-currentPageSize)+1;
					var endLimit = currentPage == Math.ceil(arrData[0] / currentPageSize) ? (currentPage*currentPageSize)-1 : (currentPage*currentPageSize);
					
					$(infoWrapper).html('showing ' + startLimit + '-' + endLimit + ' of ' + arrData[0] + ' items');

					/*
					 * PAGING
					 */

					var paging = '';

					paging += '<li title="first">First</li>';
					paging += '<li title="prev">Prev</li>';

					if(currentPage == Math.ceil(arrData[0] / currentPageSize) && currentPage-2 >= 1) 
					{
						paging += '<li title="' + (currentPage-2) + '">' + (currentPage-2) + '</li>';
					}

					if(currentPage-1 >= 1) 
					{
						paging += '<li title="' + (currentPage-1) + '">' + (currentPage-1) + '</li>';
					}

					paging += '<li id="active" title="' + currentPage + '">' + currentPage + '</li>';

					if(currentPage+1 <= Math.ceil(arrData[0] / currentPageSize)) 
					{
						paging += '<li title="' + (currentPage+1) + '">' + (currentPage+1) + '</li>';
					}

					if(currentPage == 1 && currentPage+2 <= Math.ceil(arrData[0] / currentPageSize)) 
					{
						paging += '<li title="' + (currentPage+2) + '">' + (currentPage+2) + '</li>';
					}

					paging += '<li title="next">Next</li>';
					paging += '<li title="last">Last</li>';

					$(pagingWrapper).html(paging);

					$(pagingWrapper).children('li').each(function() 
					{
						$(this).on('click', function() 
						{
							if(this.title == "prev" && currentPage-1 >= 1) 
							{
								appendData(currentPage-1, settings.currentPageSize, getCurrentDataSearch());
								settings.currentPage--;
							}
							else if(this.title == "next" && currentPage+1 <= Math.ceil(arrData[0] / currentPageSize)) 
							{
								appendData(currentPage+1, settings.currentPageSize, getCurrentDataSearch());
								settings.currentPage++;
							}
							else if(this.title == "first") 
							{
								appendData(1, settings.currentPageSize, getCurrentDataSearch());
								settings.currentPage = 1;
							}
							else if(this.title == "last") 
							{
								appendData(Math.ceil(arrData[0] / currentPageSize), settings.currentPageSize, getCurrentDataSearch());
								settings.currentPage = Math.ceil(arrData[0] / currentPageSize);
							}
							else if(parseInt(this.title) <= currentPage+2 || parseInt(this.title) >= currentPage-2) 
							{
								appendData(this.title, settings.currentPageSize, getCurrentDataSearch());
								settings.currentPage = this.title;
							}
						});
					});
				}
			});
		}

		/*
		 * FUNGSI UNTUK MENGECEK ROWNUMBER DAN ROWCHECK
		 */

		function getUsedRow() 
		{
			var temp = -1;
			settings.rowNumber == true || settings.rowNumber == 'true' ? temp += 1 : '';
			settings.rowCheck == true || settings.rowCheck == 'true' ? temp += 1 : '';

			return temp;
		}

		/*
		 * FUNGSI SORTING
		 */

	    this.sortData = function()
	    {
			/*
			 * SELECT THEAD TD DARI TABEL
			 */
			
			$(table).children('thead').children().children().each(function(index, object) 
			{
				if(index > getUsedRow())
				{
					/*
					 * EVENT CLICK UNTUK KOLOM YANG DIKLIK
					 */
					
					$(this).on('click', function()
					{
						sort = this.title;
						
						if(order == 'DESC') 
						{
							order = 'ASC';
						}
						else
						{
							order = 'DESC';
						}

						/*
						 * RELOAD BERITA
						 */
						
						appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
					});
				}
			});
	    }

	    /*
		 * FUNGSI RELOAD DATA
		 */

	    this.reload = function() 
	    {
	    	//reloadSettings();

	    	appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
	    }

		/*
		 * MERETURN ARRAY ROW YANG TERCHECK
		 */
		
		this.getChecked = function() 
		{
			//reloadSettings();

			return arrChecked.toString();
		}

		/*
		 * MENSET ARRAY ROW YANG INGIN DI CHECK
		 */
		
		this.setChecked = function(arr) 
		{
			//reloadSettings();

			for(var i = 0; i < arr.length; i++)
			{
				var temp = false;

				for(var z = 0; z < arrChecked.length; z++)
				{
					if(arrChecked[z] == arr[i])
					{
						temp = true;
					}
				}

				if(!temp)
				{
					arrChecked[arrChecked.length] = arr[i];
				}
			}

			appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
		}

		/*
		 * FUNGSI GET DATA
		 */
		
		this.getData = function(indexRow)
		{
			//reloadSettings();

			appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
			
			return arrData[indexRow];
		}

	    /*
		 * MERETURN ARRAY BERISI VALUE SEARCH
		 */

	    function getCurrentDataSearch() 
	    {
	    	var field = $(settings.searchOption).val();
    		var searchText = $(settings.search).val();

    		if(searchText == '') 
    		{
    			var arrSearch = '';
    		}
    		else
    		{
    			var arrSearch =  [
	    							{ field : field, searchText : searchText }
	    						 ];
    		}

    		return arrSearch;
	    }

	    /*
		 * FUNGSI SEARCHING DATA
		 */

	    function searchData() 
	    {	
			settings.columns.forEach(function(rowColumn) 
			{
				if(rowColumn.search == true) 
				{
					$(settings.searchOption).append('<option value="' + rowColumn.field+ '">' + rowColumn.title + '</option>');
				}
			});

	    	$(settings.search).on('keyup', function() 
	    	{
	    		appendData(1, settings.currentPageSize, getCurrentDataSearch());		 
	    	});

	    	$(settings.searchOption).on('change', function() 
	    	{
	    		appendData(1, settings.currentPageSize, getCurrentDataSearch());
	    	});
	    }

    	buildTable();
		appendData(settings.currentPage, settings.currentPageSize, getCurrentDataSearch());
		this.sortData();
		searchData();

	    return this;
	};

}( jQuery ));