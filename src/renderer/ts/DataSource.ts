interface DataSource {
    request(success: (boolean) => void, failed: (err: any) => void);
    reses: any[];
    url: string;
    threadFactory();
    title: string;
}

export default DataSource;