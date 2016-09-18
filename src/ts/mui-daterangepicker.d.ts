
interface DateType {
    year: string;
    month: string;
    day: string;
}

interface _PickerOption {
    type: string;
    /**
     * [cancelText, okText]
     */
    buttons: [string, string];
    // buttons: string[];
    startDate: Date;
    endDate: Date;
    confirm: () => void;
    cancel: () => void;
    /**
     * css selector
     */
    container: string;
}

interface _pickerObj {
    text: string,
    value: any;
    index: number;
    children ?: _pickerObj[]
}