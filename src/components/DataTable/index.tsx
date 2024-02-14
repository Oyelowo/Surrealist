import classes from "./style.module.scss";
import { Box, Text, useMantineTheme } from "@mantine/core";
import { ScrollArea, Table } from "@mantine/core";
import { useMemo } from "react";
import { renderDataCell } from "./datatypes";
import { OpenFn, ColumnSort } from "~/types";
import { useIsLight } from "~/hooks/theme";
import { useStable } from "~/hooks/stable";
import { Icon } from "../Icon";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { alphabetical, isObject } from "radash";

function isRenderable(value: any) {
	return Array.isArray(value) && value.every((v) => isObject(v));
}

interface DataTableProps {
	data: any;
	active?: string | null;
	sorting?: ColumnSort | null;
	openRecord?: OpenFn;
	headers?: string[];
	onSortingChange?: (order: ColumnSort | null) => void;
	onRowClick?: (value: any) => void;
}

export function DataTable({ data, active, sorting, openRecord, headers, onSortingChange, onRowClick }: DataTableProps) {
	const theme = useMantineTheme();
	const isLight = useIsLight();

	const handleSortClick = useStable((col: string) => {
		if (!onSortingChange) return;

		const [column, direction] = sorting || [];

		if (column === col && direction === "asc") {
			onSortingChange([col, "desc"]);
		} else if (column === col && direction === "desc") {
			onSortingChange(null);
		} else {
			onSortingChange([col, "asc"]);
		}
	});

	const [keys, values] = useMemo(() => {
		const keys: string[] = headers || [];
		const values: any[] = [];

		if (isRenderable(data)) {
			for (const datum of data) {
				const row: any = {};

				for (const [key, value] of Object.entries(datum)) {
					if (!keys.includes(key)) {
						keys.push(key);
					}

					row[key] = value;
				}

				values.push(row);
			}
		}

		const headerNames = alphabetical(keys, (key) => {
			switch (key) {
				case "id": {
					return "00000000000";
				}
				case "in": {
					return "00000000001";
				}
				case "out": {
					return "00000000002";
				}
				default: {
					return key;
				}
			}
		});

		return [headerNames, values];
	}, [data, headers, active]);

	const columnHeaders = useMemo(() => {
		return keys.map(key => (
			<Box
				key={key}
				component="th"
			>
				<Text
					span
					fw={700}
					onClick={() => handleSortClick(key)}
					style={{
						cursor: onSortingChange ? "pointer" : undefined,
						userSelect: "none",
						WebkitUserSelect: "none",
					}}
				>
					{key}
					{sorting?.[0] == key && <Icon path={sorting[1] == "asc" ? mdiChevronDown : mdiChevronUp} pos="absolute" />}
				</Text>
			</Box>
		));
	}, [isLight, keys, sorting]);

	const recordRows = useMemo(() => {
		return values.map((value, i) => {
			const columns = [...keys].map((key, j) => {
				const cellValue = value[key];

				return (
					<Box key={j} component="td" className={classes.tableValue} h={37}>
						{renderDataCell(cellValue, openRecord)}
					</Box>
				);
			});

			const isActive = active && value.id == active;

			return (
				<Box
					key={i}
					component="tr"
					onClick={() => onRowClick?.(value)}
					style={{
						backgroundColor: `${isActive ? "var(--mantine-color-light-6)" : undefined} !important`,
					}}
				>
					{columns}
				</Box>
			);
		});
	}, [keys, values, isLight]);

	if (!isRenderable(data)) {
		return <Text c="light.4">Result could not be displayed as a table.</Text>;
	}

	return (
		<div className={classes.tableContainer}>
			<ScrollArea className={classes.tableWrapper}>
				<Table className={classes.table}>
					<thead>
						<tr>{columnHeaders}</tr>
					</thead>
					<tbody>{recordRows}</tbody>
				</Table>
			</ScrollArea>
		</div>
	);
}
