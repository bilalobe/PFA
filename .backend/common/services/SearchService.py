class SearchService:
    def __init__(self, data_source):
        """
        Initializes the SearchService with a data source.
        
        :param data_source: The data source to search against.
        """
        self.data_source = data_source

    def search(self, query):
        """
        Searches the data source for items matching the query.
        
        :param query: The search query string.
        :return: A list of items matching the search query.
        """
        # Example search logic (filtering a list)
        return [item for item in self.data_source if query.lower() in item.lower()]