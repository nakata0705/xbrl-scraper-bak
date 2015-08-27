#!/usr/local/rvm/rubies/ruby-2.1.5/bin/ruby

require 'fileutils'
require 'csv'
require './params.rb'

if File.exist?("#{$workdir_name}/#{$edinetcodecsv_utf8_name}") == false
    exit(-1);
end

table = CSV.table("#{$workdir_name}/#{$edinetcodecsv_utf8_name}");
table.each do |field|
   if field[1] == "内国法人・組合" && field[2] == "上場"
        result = system("casperjs --ignore-ssl-errors=yes casperjs/getedinetreport.js #{field[0]} #{$workdir_name}");

        if result == false || File.exist?("#{$workdir_name}/#{$edinetcodezip_name}") == false
            next;
        end
        
        
   end
end
