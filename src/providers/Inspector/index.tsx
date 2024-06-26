import { useDisclosure } from "@mantine/hooks";
import { createContext, useContext, PropsWithChildren, useState } from "react";
import { HistoryHandle, useHistory } from "~/hooks/history";
import { useStable } from "~/hooks/stable";
import { InspectorDrawer } from "./drawer";
import { RecordsChangedEvent } from "~/util/global-events";

type InspectFunction = (id: string) => void;
type StopInspectFunction = () => void;

const InspectorContext = createContext<{
	history: HistoryHandle<string>;
	inspect: InspectFunction;
	stopInspect: StopInspectFunction;
} | null>(null);

/**
 * Access the inspect function
 */
export function useInspector() {
	const ctx = useContext(InspectorContext);

	if (!ctx) {
		throw new Error("useInspector must be used within an InspectorProvider");
	}

	return ctx;
}

export function InspectorProvider({ children }: PropsWithChildren) {
	const [historyItems, setHistoryItems] = useState<string[]>([]);
	const [isInspecting, isInspectingHandle] = useDisclosure();

	const history = useHistory({
		history: historyItems,
		setHistory: setHistoryItems
	});

	const inspect = useStable((id: string) => {
		isInspectingHandle.open();

		if (isInspecting) {
			history.push(id);
		} else {
			setHistoryItems([id]);
		}
	});

	const stopInspect = useStable(() => {
		isInspectingHandle.close();
	});

	const dispatchEvent = useStable(() => {
		RecordsChangedEvent.dispatch(null);
	});

	return (
		<InspectorContext.Provider value={{history, inspect, stopInspect}}>
			{children}

			<InspectorDrawer
				opened={isInspecting}
				history={history}
				onClose={isInspectingHandle.close}
				onRefresh={dispatchEvent}
			/>
		</InspectorContext.Provider>
	);
}