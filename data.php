<?php

	mysql_connect('localhost', 'root', '');
	mysql_select_db('example');

	$limit = $_POST['limit'];
	$offset = $_POST['offset'];
	$sort = $_POST['sort'];
	$order = $_POST['order'];
	$searchData = $_POST['searchData'];

	$arrRows = array();
	$arrResult = array();

	$select = 'SELECT * FROM city ';
	$select_total = 'SELECT COUNT(*) FROM city ';
	$searchData != '' ? $where = 'WHERE ' . $searchData[0]['field'] . ' LIKE \'%' . $searchData[0]['searchText'] . '%\' ' : $where = '';
	$sort != '' ? $sortby = 'ORDER BY ' . $sort . ' ' . $order . ' ' : $sortby = '';
	$limit =  'LIMIT ' . $limit . ', ' . $offset;

	//Filtered data
	$query = mysql_query($select . $where . $sortby . $limit);

	//All data
	$query_total = mysql_query($select_total . $where);
	$arrResult['total'] = mysql_fetch_row($query_total);
	
	while ($rows = mysql_fetch_array($query)) {
		array_push($arrRows, preg_replace("/[^A-Za-z0-9.]/", '', $rows));
	}

	$arrResult['rows'] = $arrRows;

	echo json_encode($arrResult);
?>