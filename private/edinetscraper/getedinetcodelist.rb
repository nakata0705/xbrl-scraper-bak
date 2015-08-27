#!/usr/local/rvm/rubies/ruby-2.1.5/bin/ruby

require 'fileutils'
require './params.rb'

FileUtils.rm_rf($workdir_name);
FileUtils.mkdir_p($workdir_name);

result = system("casperjs --ignore-ssl-errors=yes casperjs/getedinetcodelist.js #{$workdir_name}/#{$edinetcodezip_name}");

if result == false || File.exist?("#{$workdir_name}/#{$edinetcodezip_name}") == false
    exit(-1);
end

result = system("unzip -o -q -d #{$workdir_name} #{$workdir_name}/#{$edinetcodezip_name}");
result = system("rm #{$workdir_name}/#{$edinetcodezip_name}");
if result == false || File.exist?("#{$workdir_name}/#{$edinetcodecsv_name}") == false
    exit(-1);
end

result = system("nkf -w -Lu -d #{$workdir_name}/#{$edinetcodecsv_name} > #{$workdir_name}/#{$edinetcodecsv_utf8_name}.tmp");
result = system("rm #{$workdir_name}/#{$edinetcodecsv_name}");

f_in  = File.open("#{$workdir_name}/#{$edinetcodecsv_utf8_name}.tmp", "r:utf-8");
f_out = File.open("#{$workdir_name}/#{$edinetcodecsv_utf8_name}", "w:utf-8");

lines = 0;

f_in.each_line do |line|
    if lines >= 1
      f_out.write(line);
    end
    lines = lines + 1;
end

f_in.close();
f_out.close();

result = system("rm #{$workdir_name}/#{$edinetcodecsv_utf8_name}.tmp");
